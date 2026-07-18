import {resolve} from 'node:path';
import {hashObject, snapshotHash} from '../lib/hashing.mjs';
import {parseArgs, readJsonYaml, requireArg, writeJson} from '../lib/io.mjs';
import {readResolvedJson} from '../lib/content-store.mjs';
import {matchException} from '../lib/policy.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';
import {verifyContracts} from '../lib/semantic-verification.mjs';

const args = parseArgs(process.argv.slice(2));
const official = await readResolvedJson(resolve(requireArg(args, 'official')));
const figma = await readResolvedJson(resolve(requireArg(args, 'figma')));
await assertArtifact('official', official);
await assertArtifact('figma', figma);
if (!figma.coverage?.complete) throw new Error('Cannot create executable diff from partial Figma coverage');
const configRoot = resolve(import.meta.dirname, '../config');
const exceptionConfig = await readJsonYaml(resolve(args.exceptions ?? resolve(configRoot, 'exceptions.yaml')));
const output = resolve(args.output ?? resolve(requireArg(args, 'run'), 'diff.json'));

const figmaByName = new Map(figma.components.map((entry) => [entry.officialName ?? entry.name, entry]));
const officialByName = new Map(official.components.map((entry) => [entry.name, entry]));
const differences = [];

for (const component of official.components) {
  const identity = `component:${component.name}`;
  const existing = figmaByName.get(component.name);
  if (!existing) {
    differences.push({
      id: `missing:${component.name}`,
      status: 'missing',
      kind: 'component',
      identity,
      official: {name: component.name},
      figma: null,
      suggestedOperation: 'ADD_COMPONENT',
      evidence: component.evidence,
    });
    continue;
  }
  const officialProps = new Map((component.props ?? []).map((prop) => [prop.name, prop]));
  const figmaProps = new Map((existing.documentedProps ?? existing.props ?? []).map((prop) => [prop.name, prop]));
  const officialUsage = {description: component.usage?.description ?? null, import: component.import ?? null};
  const figmaUsage = {description: existing.usage?.description ?? existing.description ?? null, import: existing.usage?.import ?? existing.import ?? null};
  if (JSON.stringify(officialUsage) !== JSON.stringify(figmaUsage)) {
    differences.push({
      id: `changed-usage:${component.name}`,
      status: 'changed',
      kind: 'component-documentation',
      identity: `${identity}/usage`,
      official: officialUsage,
      figma: figmaUsage,
      targetNodeId: existing.nodeId,
      suggestedOperation: 'UPDATE_DOCUMENTATION',
      evidence: component.evidence,
    });
  }
  for (const [name, prop] of officialProps) {
    const figmaProp = figmaProps.get(name);
    if (!figmaProp) {
      differences.push({
        id: `missing-prop:${component.name}.${name}`,
        status: 'missing',
        kind: 'prop-documentation',
        identity: `${identity}/prop:${name}`,
        official: prop,
        figma: null,
        targetNodeId: existing.nodeId,
        suggestedOperation: 'ADD_PROP_ROW',
        evidence: component.evidence,
      });
    } else {
      const fields = ['type', 'description', 'required', 'default'];
      const expected = Object.fromEntries(fields.map((field) => [field, prop[field] ?? null]));
      const actual = Object.fromEntries(fields.map((field) => [field, figmaProp[field] ?? null]));
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        differences.push({
          id: `changed-prop:${component.name}.${name}`,
          status: 'changed',
          kind: 'prop-documentation',
          identity: `${identity}/prop:${name}`,
          official: expected,
          figma: actual,
          targetNodeId: existing.nodeId,
          suggestedOperation: 'UPDATE_DOCUMENTATION',
          evidence: component.evidence,
        });
      }
    }
  }
  for (const [name, prop] of figmaProps) {
    if (!officialProps.has(name)) {
      differences.push({
        id: `extra-prop:${component.name}.${name}`,
        status: 'extra',
        kind: 'prop-documentation',
        identity: `${identity}/prop:${name}`,
        official: null,
        figma: prop,
        targetNodeId: existing.nodeId,
        suggestedOperation: 'UPDATE_DOCUMENTATION',
        evidence: component.evidence,
      });
    }
  }
}

for (const component of figma.components) {
  const name = component.officialName ?? component.name;
  if (officialByName.has(name)) continue;
  const identity = `component:${name}`;
  const exception = matchException(identity, exceptionConfig.exceptions);
  differences.push({
    id: `extra:${name}`,
    status: exception ? 'exception' : 'extra',
    kind: 'component',
    identity,
    official: null,
    figma: {name, nodeId: component.nodeId},
    targetNodeId: component.nodeId,
    suggestedOperation: exception ? null : 'REMOVE_COMPONENT',
    exception: exception?.id,
    evidence: exception?.evidence ?? [],
  });
}

const semanticScope = String(args['semantic-scope'] ?? '').split(',').map((value) => value.trim()).filter(Boolean);
if (semanticScope.length) {
  const contracts = await readJsonYaml(resolve(args.contracts ?? resolve(configRoot, 'component-contracts.json')));
  if (contracts.sourceVersion !== official.sourceVersion) throw new Error('Semantic component contracts do not match the official source version');
  const semantic = verifyContracts(figma, contracts, semanticScope);
  for (const assertion of semantic.assertions.filter((entry) => entry.passed !== true)) {
    differences.push({
      id: `semantic:${assertion.code}:${assertion.target}`,
      status: 'unverifiable',
      kind: 'semantic-contract',
      identity: assertion.target,
      official: {assertion: assertion.code},
      figma: assertion.evidence,
      suggestedOperation: null,
      evidence: [`contract:${contracts.sourceVersion}:${assertion.code}`],
    });
  }
}

const generatedAt = [official.generatedAt, figma.generatedAt].filter(Boolean).sort().at(-1);
const diff = {
  schemaVersion: 1,
  generatedAt,
  sourceVersion: official.sourceVersion,
  figmaFileKey: figma.fileKey,
  officialHash: hashObject(official),
  figmaBeforeHash: snapshotHash(figma),
  summary: Object.fromEntries(
    ['missing', 'extra', 'changed', 'conflicting', 'unverifiable', 'exception'].map((status) => [
      status,
      differences.filter((entry) => entry.status === status).length,
    ]),
  ),
  differences: differences.sort((a, b) => a.id.localeCompare(b.id)),
};

await writeJson(output, diff);
process.stdout.write(`${JSON.stringify({output, summary: diff.summary})}\n`);
