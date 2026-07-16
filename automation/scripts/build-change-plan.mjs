import {resolve} from 'node:path';
import {hashObject, sha256Text} from '../lib/hashing.mjs';
import {parseArgs, readJson, readJsonYaml, requireArg, writeJson} from '../lib/io.mjs';
import {classifyRisk, isExecutableDifference} from '../lib/policy.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';

const args = parseArgs(process.argv.slice(2));
const diff = await readJson(resolve(requireArg(args, 'diff')));
const rules = await readJsonYaml(resolve(args.rules ?? resolve(import.meta.dirname, '../config/risk-rules.yaml')));
const config = await readJsonYaml(resolve(args.config ?? resolve(import.meta.dirname, '../config/library.yaml')));
const runId = String(args['run-id'] ?? requireArg(args, 'run').split(/[\\/]/).filter(Boolean).at(-1));
const output = resolve(args.output ?? resolve(requireArg(args, 'run'), 'plan.json'));

function operationFor(difference) {
  const type = difference.suggestedOperation;
  const risk = classifyRisk(type, rules);
  const id = `op-${sha256Text(`${type}:${difference.identity}`).slice(0, 12)}`;
  const visual = ['REPLACE_ASSET', 'UPDATE_COMPONENT_PROPERTY', 'ADD_VARIANT', 'UPDATE_LAYOUT', 'BIND_TOKEN'].includes(type);
  return {
    id,
    type,
    target: {
      identity: difference.identity,
      nodeId: difference.targetNodeId ?? null,
    },
    risk,
    evidence: difference.evidence ?? [],
    preconditions: {
      differenceId: difference.id,
      current: difference.figma,
    },
    expected: difference.official,
    verification: {
      readback: true,
      screenshot: visual,
      assertions: visual
        ? ['target matches expected structure', 'bounds and clipping are valid', 'no broken dependent instances']
        : ['target content matches expected official value'],
    },
  };
}

const operations = diff.differences.filter((entry) => entry.suggestedOperation && isExecutableDifference(entry)).map(operationFor);
const affectedComponents = new Set(operations.map((operation) => operation.target.identity.split('/')[0]));
const bulkRisk = {
  required: operations.length > config.risk.bulkNodeThreshold || affectedComponents.size > config.risk.bulkComponentThreshold,
  operationCount: operations.length,
  affectedComponentCount: affectedComponents.size,
  nodeThreshold: config.risk.bulkNodeThreshold,
  componentThreshold: config.risk.bulkComponentThreshold,
};
const plan = {
  schemaVersion: 1,
  runId,
  sourceVersion: diff.sourceVersion,
  figmaFileKey: diff.figmaFileKey,
  figmaBeforeHash: diff.figmaBeforeHash,
  officialHash: diff.officialHash,
  generatedAt: diff.generatedAt,
  operations: operations.sort((a, b) => a.id.localeCompare(b.id)),
  bulkRisk,
  blockedDifferences: diff.differences.filter((entry) => ['conflicting', 'unverifiable'].includes(entry.status)),
  exceptions: diff.differences.filter((entry) => entry.status === 'exception'),
};
plan.planHash = hashObject(plan, ['planHash']);

await assertArtifact('plan', plan);
await writeJson(output, plan);
process.stdout.write(`${JSON.stringify({output, planHash: plan.planHash, operations: plan.operations.length})}\n`);
