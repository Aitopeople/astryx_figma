import {resolve} from 'node:path';
import {parseArgs, requireArg, writeJson} from '../lib/io.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';
import {readResolvedJson} from '../lib/content-store.mjs';
import {hashObject} from '../lib/hashing.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = resolve(requireArg(args, 'input'));
const outputPath = resolve(args.output ?? inputPath.replace(/\.json$/i, '.normalized.json'));
const raw = await readResolvedJson(inputPath);
const baseline = args.baseline ? await readResolvedJson(resolve(args.baseline)) : null;
const batches = raw.batches ?? raw.coverage?.batches ?? [];
const sources = raw.batches ? batches : [raw];
const incoming = (key) => sources.flatMap((source) => source[key] ?? []);
const requestedScope = String(args.scope ?? '').split(',').map((value) => value.trim()).filter(Boolean);

function identityFor(key, entry) {
  if (key === 'components') return entry.nodeId ?? entry.officialName ?? entry.name;
  if (key === 'pages' || key === 'instances') return entry.nodeId ?? entry.id;
  if (key === 'variables') return entry.id ?? entry.name;
  if (key === 'styles') return entry.id ?? `${entry.type}:${entry.name}`;
  if (key === 'assets') return entry.nodeId ?? `${entry.owner}:${entry.url ?? entry.hash}`;
  if (key === 'placeholders') return entry.nodeId ?? entry.id ?? `${entry.page}:${entry.name}`;
  return entry.nodeId ?? entry.id ?? entry.name;
}

function sortedUnique(records, key) {
  const map = new Map();
  for (const record of records) {
    const identity = identityFor(key, record);
    if (!identity) throw new Error(`${key} record is missing a stable identity`);
    map.set(identity, record);
  }
  return [...map.values()].sort((a, b) => identityFor(key, a).localeCompare(identityFor(key, b)));
}

const updatedPages = incoming('pages');
const updatedPageNames = new Set(updatedPages.map((entry) => entry.name).filter(Boolean));
const updatedPageIds = new Set(updatedPages.map((entry) => entry.nodeId ?? entry.id).filter(Boolean));
const covers = (record) => updatedPageNames.has(record.page) || updatedPageNames.has(record.pageName)
  || updatedPageIds.has(record.pageId) || updatedPageIds.has(record.ownerPageId);

function merged(key) {
  const fresh = incoming(key);
  if (!baseline) return sortedUnique(fresh, key);
  if (['variables', 'styles'].includes(key)) {
    if (!fresh.length) return baseline[key] ?? [];
    const freshIds = new Set(fresh.map((entry) => identityFor(key, entry)));
    return sortedUnique([...(baseline[key] ?? []).filter((entry) => !freshIds.has(identityFor(key, entry))), ...fresh], key);
  }
  if (key === 'pages') return sortedUnique([...(baseline.pages ?? []).filter((entry) => !updatedPageIds.has(entry.nodeId ?? entry.id)), ...fresh], key);
  return sortedUnique([...(baseline[key] ?? []).filter((entry) => !covers(entry)), ...fresh], key);
}

const batchComplete = raw.coverage?.complete ?? (!batches.length || batches.every((batch) => batch.complete === true));
const scopeCovered = requestedScope.every((target) => updatedPageNames.has(target) || updatedPageIds.has(target));
const complete = baseline ? baseline.coverage?.complete === true && batchComplete && scopeCovered : batchComplete;
if (!complete && args['allow-partial'] !== true) {
  throw new Error(baseline
    ? 'Scoped Figma snapshot does not cover every requested page or the baseline is incomplete'
    : 'Figma snapshot coverage is incomplete; pass --allow-partial only for diagnostics');
}

const components = merged('components');
const pages = merged('pages');
const variables = merged('variables');
const styles = merged('styles');
const instances = merged('instances');
const assets = merged('assets');
const placeholders = merged('placeholders');
const pageHashes = Object.fromEntries(pages.map((page) => {
  const name = page.name;
  const record = {
    page,
    components: components.filter((entry) => entry.page === name || entry.pageId === page.nodeId),
    instances: instances.filter((entry) => entry.page === name || entry.pageId === page.nodeId),
    assets: assets.filter((entry) => entry.page === name || entry.pageId === page.nodeId),
    placeholders: placeholders.filter((entry) => entry.page === name || entry.pageId === page.nodeId),
  };
  return [page.nodeId ?? page.id, hashObject(record)];
}));
const foundationHash = hashObject({variables, styles});

const normalized = {
  schemaVersion: 1,
  fileKey: raw.fileKey ?? baseline?.fileKey,
  fileName: raw.fileName ?? baseline?.fileName,
  generatedAt: raw.generatedAt ?? new Date().toISOString(),
  coverage: {
    complete,
    mode: baseline ? 'scoped' : 'full',
    scope: requestedScope,
    baselineHash: baseline ? hashObject(baseline) : null,
    batches: batches.map((batch, index) => ({
      id: batch.id ?? `batch-${index + 1}`,
      complete: batch.complete === true,
      pages: batch.pages?.map((page) => page.nodeId ?? page.id) ?? [],
    })),
  },
  inventory: {
    pages: pages.length,
    components: components.length,
    componentSets: components.filter((entry) => entry.nodeType === 'COMPONENT_SET').length,
    variables: variables.length,
    styles: styles.length,
    instances: instances.length,
    brokenInstances: instances.filter((entry) => entry.broken === true).length,
    activePlaceholders: placeholders.filter((entry) => entry.active !== false).length,
  },
  integrity: {
    pageHashes,
    foundationHash,
    merkleRoot: hashObject({fileKey: raw.fileKey ?? baseline?.fileKey, pageHashes, foundationHash}),
  },
  components,
  pages,
  variables,
  styles,
  instances,
  assets,
  placeholders,
};

if (!normalized.fileKey) throw new Error('Figma snapshot must include fileKey');
await assertArtifact('figma', normalized);
await writeJson(outputPath, normalized);
process.stdout.write(`${JSON.stringify({output: outputPath, mode: normalized.coverage.mode, scope: requestedScope, merkleRoot: normalized.integrity.merkleRoot, inventory: normalized.inventory})}\n`);
