import {execFile} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {promisify} from 'node:util';
import {resolve} from 'node:path';
import {parseArgs, readJson, writeJson} from '../lib/io.mjs';
import {extractAssetReferences} from '../lib/asset-references.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';
import {exists, writeArtifactReference} from '../lib/content-store.mjs';
import {sha256File, sha256Text} from '../lib/hashing.mjs';

const execFileAsync = promisify(execFile);
const args = parseArgs(process.argv.slice(2));
const root = resolve(import.meta.dirname, '../..');
const cli = resolve(root, 'node_modules/@astryxdesign/cli/bin/astryx.mjs');
const packageJson = await readJson(resolve(root, 'package.json'));
const sourceVersion = packageJson.dependencies?.['@astryxdesign/core'];
const cliVersion = packageJson.devDependencies?.['@astryxdesign/cli'];
if (!sourceVersion || sourceVersion !== cliVersion) {
  throw new Error(`Core/CLI versions must match exactly; got core=${sourceVersion}, cli=${cliVersion}`);
}
if (!/^\d+\.\d+\.\d+$/.test(sourceVersion)) {
  throw new Error(`Core/CLI versions must be exact semver without a range: ${sourceVersion}`);
}

const runId = String(args.run ?? `astryx-${sourceVersion}-${new Date().toISOString().replace(/[:.]/g, '-')}`);
const output = resolve(args.output ?? resolve(root, 'automation/runs', runId, 'official.json'));
const limit = args.limit ? Number(args.limit) : Infinity;
const includeTemplateSource = args['skip-template-source'] !== true;
const cacheRoot = resolve(args['cache-root'] ?? resolve(root, 'automation/cache'));
const fingerprint = sha256Text(JSON.stringify({
  sourceVersion,
  cliVersion,
  cliHash: await sha256File(cli),
  lockHash: await sha256File(resolve(root, 'package-lock.json')).catch(() => null),
  limit: Number.isFinite(limit) ? limit : null,
  includeTemplateSource,
}));
const cachePath = resolve(cacheRoot, 'official', sourceVersion, `${fingerprint}.json`);

if (args.refresh !== true && await exists(cachePath)) {
  const cached = JSON.parse(await readFile(cachePath, 'utf8'));
  await assertArtifact('official', cached);
  if (args.materialize === true) await writeJson(output, cached);
  else await writeArtifactReference(output, cachePath, 'official', {sourceVersion, cacheHit: true, fingerprint});
  process.stdout.write(`${JSON.stringify({runId, output, cachePath, cacheHit: true, inventory: cached.inventory})}\n`);
  process.exit(0);
}

async function runCli(cliArgs) {
  const {stdout} = await execFileAsync(process.execPath, [cli, ...cliArgs, '--json'], {
    cwd: root,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
  return JSON.parse(stdout);
}

async function mapConcurrent(values, concurrency, mapper) {
  const result = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      result[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, values.length)}, worker));
  return result;
}

function flattenComponentNames(data) {
  const records = Object.values(data ?? {}).flat();
  return [...new Set(records.map((entry) => entry?.name).filter(Boolean))].sort();
}

function normalizeSource(source = '') {
  return source.replace(/^\/\/ Copyright \(c\) Meta Platforms, Inc\. and affiliates\.\r?\n\r?\n/, '');
}

const [componentList, templateList, tokenDocs] = await Promise.all([
  runCli(['component', '--list']),
  runCli(['template', '--list']),
  runCli(['docs', 'tokens']),
]);

const componentNames = flattenComponentNames(componentList.data).slice(0, limit);
const templateMetadata = (templateList.data ?? []).slice(0, limit);
const components = await mapConcurrent(componentNames, 6, async (name) => {
  const detail = await runCli(['component', name]);
  return {
    ...detail.data,
    name,
    props: detail.data?.props ?? [],
    evidence: [`cli:component:${name}@${sourceVersion}`],
  };
});

const templates = includeTemplateSource
  ? await mapConcurrent(templateMetadata, 6, async (metadata) => {
      const detail = await runCli(['template', metadata.id]);
      return {
        ...metadata,
        description: detail.data?.description ?? metadata.description,
        components: detail.data?.components ?? [],
        source: normalizeSource(detail.data?.source ?? ''),
        evidence: [`cli:template:${metadata.id}@${sourceVersion}`],
      };
    })
  : templateMetadata.map((metadata) => ({...metadata, evidence: [`cli:template-list@${sourceVersion}`]}));

const official = {
  schemaVersion: 1,
  sourceVersion,
  cliVersion,
  generatedAt: new Date().toISOString(),
  inventory: {
    components: componentNames.length,
    pageTemplates: templateMetadata.filter((entry) => entry.type === 'page').length,
    blockTemplates: templateMetadata.filter((entry) => entry.type === 'block').length,
  },
  components: components.sort((a, b) => a.name.localeCompare(b.name)),
  templates: templates.sort((a, b) => a.id.localeCompare(b.id)),
  tokens: tokenDocs.data ?? {},
  assets: extractAssetReferences(templates, sourceVersion),
  evidence: [
    {kind: 'package', source: 'package.json', version: sourceVersion},
    {kind: 'cli', source: 'component --list --json', version: sourceVersion},
    {kind: 'cli', source: 'template --list --json', version: sourceVersion},
    {kind: 'cli', source: 'docs tokens --json', version: sourceVersion},
  ],
};

await assertArtifact('official', official);
await writeJson(cachePath, official);
if (args.materialize === true) await writeJson(output, official);
else await writeArtifactReference(output, cachePath, 'official', {sourceVersion, cacheHit: false, fingerprint});
process.stdout.write(`${JSON.stringify({runId, output, cachePath, cacheHit: false, inventory: official.inventory})}\n`);
