import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';

const args = parseArgs(process.argv.slice(2));
const inputPath = resolve(requireArg(args, 'input'));
const outputPath = resolve(args.output ?? inputPath.replace(/\.json$/i, '.normalized.json'));
const raw = await readJson(inputPath);

const batches = raw.batches ?? raw.coverage?.batches ?? [];
const sources = raw.batches ? batches : [raw];
const merge = (key) => sources.flatMap((source) => source[key] ?? []);
const complete = raw.coverage?.complete ?? batches.every((batch) => batch.complete === true);
if (!complete && args['allow-partial'] !== true) {
  throw new Error('Figma snapshot coverage is incomplete; pass --allow-partial only for diagnostics');
}

function sortedUnique(records, identity, label) {
  const map = new Map();
  for (const record of records) {
    const key = identity(record);
    if (!key) throw new Error(`${label} record is missing a stable identity`);
    if (map.has(key) && JSON.stringify(map.get(key)) !== JSON.stringify(record)) {
      throw new Error(`Conflicting duplicate ${label} identity: ${key}`);
    }
    map.set(key, record);
  }
  return [...map.values()].sort((a, b) => identity(a).localeCompare(identity(b)));
}

const components = sortedUnique(merge('components'), (entry) => entry.officialName ?? entry.name, 'component');
const pages = sortedUnique(merge('pages'), (entry) => entry.nodeId ?? entry.id, 'page');
const variables = sortedUnique(merge('variables'), (entry) => entry.id ?? entry.name, 'variable');
const styles = sortedUnique(merge('styles'), (entry) => entry.id ?? `${entry.type}:${entry.name}`, 'style');
const instances = sortedUnique(merge('instances'), (entry) => entry.nodeId ?? entry.id, 'instance');
const assets = sortedUnique(merge('assets'), (entry) => entry.nodeId ?? `${entry.owner}:${entry.url ?? entry.hash}`, 'asset');

const normalized = {
  schemaVersion: 1,
  fileKey: raw.fileKey,
  fileName: raw.fileName,
  generatedAt: raw.generatedAt ?? new Date().toISOString(),
  coverage: {
    complete,
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
    activePlaceholders: merge('placeholders').filter((entry) => entry.active !== false).length,
  },
  components,
  pages,
  variables,
  styles,
  instances,
  assets,
};

if (!normalized.fileKey) throw new Error('Figma snapshot must include fileKey');
await assertArtifact('figma', normalized);
await writeJson(outputPath, normalized);
process.stdout.write(`${JSON.stringify({output: outputPath, inventory: normalized.inventory})}\n`);
