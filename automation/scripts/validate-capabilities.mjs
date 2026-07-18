import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const plan = await readJson(resolve(requireArg(args, 'plan')));
const capabilities = await readJson(resolve(args.capabilities ?? resolve(import.meta.dirname, '../config/figma-capabilities.json')));
const blocked = [];
const requiredAssertions = {};
for (const operation of plan.operations ?? []) {
  for (const mechanic of operation.mechanics ?? []) {
    if (capabilities.blockedMechanics?.[mechanic]) blocked.push({operationId: operation.id, mechanic, reason: capabilities.blockedMechanics[mechanic]});
    if (capabilities.requiredAssertions?.[mechanic]) requiredAssertions[operation.id] = [...new Set([...(requiredAssertions[operation.id] ?? []), ...capabilities.requiredAssertions[mechanic]])];
  }
}
const result = {valid: blocked.length === 0, blocked, requiredAssertions};
if (args.output) await writeJson(resolve(args.output), result);
process.stdout.write(`${JSON.stringify({valid: result.valid, blocked: blocked.length, assertionAugmentations: Object.keys(requiredAssertions).length})}\n`);
if (!result.valid) process.exitCode = 1;
