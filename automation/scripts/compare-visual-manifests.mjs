import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const baseline = await readJson(resolve(requireArg(args, 'baseline')));
const current = await readJson(resolve(requireArg(args, 'current')));
const before = new Map((baseline.images ?? []).map((entry) => [entry.id, entry]));
const after = new Map((current.images ?? []).map((entry) => [entry.id, entry]));
const reused = [], changed = [], added = [], missing = [];
for (const [id, entry] of after) {
  const prior = before.get(id);
  if (!prior) added.push(entry);
  else if (prior.sha256 === entry.sha256) reused.push(entry);
  else changed.push({id, before: prior, after: entry, dimensionsChanged: JSON.stringify(prior.dimensions) !== JSON.stringify(entry.dimensions)});
}
for (const [id, entry] of before) if (!after.has(id)) missing.push(entry);
const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  summary: {reused: reused.length, changed: changed.length, added: added.length, missing: missing.length},
  reusedIds: reused.map((entry) => entry.id),
  reviewQueue: [...changed, ...added.map((entry) => ({id: entry.id, before: null, after: entry, dimensionsChanged: true}))],
  missing,
};
const output = resolve(args.output ?? resolve(requireArg(args, 'run'), 'visual-diff.json'));
await writeJson(output, result);
process.stdout.write(`${JSON.stringify({output, ...result.summary, modelReviewQueue: result.reviewQueue.length})}\n`);
