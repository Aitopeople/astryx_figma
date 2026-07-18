import {resolve} from 'node:path';
import {readResolvedJson} from '../lib/content-store.mjs';
import {parseArgs, requireArg, writeJson} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const figma = await readResolvedJson(resolve(requireArg(args, 'figma')));
const requested = String(requireArg(args, 'components')).split(',').map((value) => value.trim()).filter(Boolean);
const requestedSet = new Set(requested);
const components = figma.components.filter((entry) => requestedSet.has(entry.officialName ?? entry.name));
const missing = requested.filter((name) => !components.some((entry) => (entry.officialName ?? entry.name) === name));
const componentIds = new Set(components.map((entry) => entry.nodeId));
const pageNames = new Set(components.map((entry) => entry.page).filter(Boolean));
const dependentInstances = (figma.instances ?? []).filter((entry) => componentIds.has(entry.mainComponentId) || requestedSet.has(entry.officialComponent));
for (const instance of dependentInstances) if (instance.page) pageNames.add(instance.page);
const pages = figma.pages.filter((entry) => pageNames.has(entry.name));
const plan = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  components: requested,
  missingComponents: missing,
  componentNodeIds: [...componentIds].sort(),
  pageNames: [...pageNames].sort(),
  pageIds: pages.map((entry) => entry.nodeId ?? entry.id).sort(),
  dependentInstanceIds: dependentInstances.map((entry) => entry.nodeId ?? entry.id).sort(),
  includeFoundations: args['include-foundations'] === true,
  complete: missing.length === 0 && pages.length === pageNames.size,
};
const output = resolve(args.output ?? resolve(requireArg(args, 'run'), 'read-scope.json'));
await writeJson(output, plan);
process.stdout.write(`${JSON.stringify({output, complete: plan.complete, pages: plan.pageIds.length, components: componentIds.size, dependentInstances: dependentInstances.length})}\n`);
if (!plan.complete) process.exitCode = 1;
