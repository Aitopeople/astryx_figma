import {readdir, stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';
import {isArtifactReference} from '../lib/content-store.mjs';

const args = parseArgs(process.argv.slice(2));
const runDir = resolve(requireArg(args, 'run'));

async function filesUnder(path) {
  const output = [];
  for (const entry of await readdir(path, {withFileTypes: true})) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) output.push(...await filesUnder(child));
    else output.push(child);
  }
  return output;
}

const files = await filesUnder(runDir);
const records = await Promise.all(files.map(async (path) => ({path, ...(await stat(path))})));
const jsonFiles = records.filter((entry) => entry.path.endsWith('.json'));
let references = 0;
let cacheHits = 0;
for (const entry of jsonFiles) {
  const value = await readJson(entry.path).catch(() => null);
  if (isArtifactReference(value)) references += 1;
  if (value?.cacheHit === true) cacheHits += 1;
}
const screenshots = records.filter((entry) => /\.(png|jpe?g|webp)$/i.test(entry.path));
const before = await readJson(resolve(runDir, 'figma-before.json')).catch(() => null);
const after = await readJson(resolve(runDir, 'figma-after.json')).catch(() => null);
const result = {
  schemaVersion: 1,
  runId: runDir.split(/[\\/]/).at(-1),
  generatedAt: new Date().toISOString(),
  files: records.length,
  totalBytes: records.reduce((sum, entry) => sum + entry.size, 0),
  artifactReferences: references,
  cacheHits,
  screenshots: screenshots.length,
  screenshotBytes: screenshots.reduce((sum, entry) => sum + entry.size, 0),
  snapshotModeBefore: before?.coverage?.mode ?? null,
  snapshotModeAfter: after?.coverage?.mode ?? null,
  scopeBefore: before?.coverage?.scope ?? [],
  scopeAfter: after?.coverage?.scope ?? [],
  pageCountBefore: before?.inventory?.pages ?? null,
  pageCountAfter: after?.inventory?.pages ?? null,
  figmaReadCalls: Number(args['figma-read-calls'] ?? 0),
  figmaWriteCalls: Number(args['figma-write-calls'] ?? 0),
  screenshotsReused: Number(args['screenshots-reused'] ?? 0),
  elapsedMs: Number(args['elapsed-ms'] ?? 0),
  budgetWarnings: [],
};
const maxScreenshots = Number(args['max-screenshots'] ?? 8);
const maxRunBytes = Number(args['max-run-bytes'] ?? 5 * 1024 * 1024);
if (result.screenshots > maxScreenshots) result.budgetWarnings.push(`screenshot count ${result.screenshots} exceeds ${maxScreenshots}`);
if (result.totalBytes > maxRunBytes) result.budgetWarnings.push(`run bytes ${result.totalBytes} exceeds ${maxRunBytes}`);
if (result.snapshotModeBefore === 'full' && (result.scopeBefore?.length ?? 0) > 0) result.budgetWarnings.push('scoped run used a full before snapshot');
if (result.figmaWriteCalls > 0 && result.figmaReadCalls < 2) result.budgetWarnings.push('write run did not record separate before/after Figma reads');
const output = resolve(args.output ?? resolve(runDir, 'efficiency.json'));
await writeJson(output, result);
process.stdout.write(`${JSON.stringify({output, totalBytes: result.totalBytes, screenshots: result.screenshots, references, cacheHits, warnings: result.budgetWarnings.length})}\n`);
