import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const plan = await readJson(resolve(requireArg(args, 'plan')));
const visualTypes = new Set(['REPLACE_ASSET', 'UPDATE_COMPONENT_PROPERTY', 'ADD_VARIANT', 'UPDATE_LAYOUT', 'BIND_TOKEN', 'ADD_COMPONENT']);
const groups = new Map();
for (const operation of plan.operations ?? []) {
  if (!visualTypes.has(operation.type)) continue;
  const component = operation.target.identity.split('/')[0].replace(/^component:/, '');
  if (!groups.has(component)) groups.set(component, {component, operationIds: [], reasons: new Set(), minimumScale: 2});
  const group = groups.get(component);
  group.operationIds.push(operation.id);
  group.reasons.add(operation.type);
  for (const mechanic of operation.mechanics ?? []) group.reasons.add(mechanic);
}
const captures = [...groups.values()].map((entry) => ({
  component: entry.component,
  operationIds: entry.operationIds,
  reasons: [...entry.reasons].sort(),
  minimumScale: entry.minimumScale,
  strategy: 'containing-frame-first',
  review: 'machine-diff-first; model-review-on-difference',
}));
const result = {
  schemaVersion: 1,
  structuralGateRequired: true,
  skipScreenshotsWhenStructuralGateFails: true,
  reuseUnchangedScreenshotHashes: true,
  contactSheetPreferred: true,
  captures,
};
const output = resolve(args.output ?? resolve(requireArg(args, 'run'), 'screenshot-plan.json'));
await writeJson(output, result);
process.stdout.write(`${JSON.stringify({output, captureGroups: captures.length, operationCount: captures.reduce((count, entry) => count + entry.operationIds.length, 0)})}\n`);
