import {resolve} from 'node:path';
import {readResolvedJson} from '../lib/content-store.mjs';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';
import {verifyContracts} from '../lib/semantic-verification.mjs';

const args = parseArgs(process.argv.slice(2));
const figma = await readResolvedJson(resolve(requireArg(args, 'figma')));
const contracts = await readJson(resolve(args.contracts ?? resolve(import.meta.dirname, '../config/component-contracts.json')));
if (contracts.sourceVersion && args.version && contracts.sourceVersion !== args.version) throw new Error('Component contracts do not match the requested Astryx version');
const scope = String(args.scope ?? '').split(',').map((value) => value.trim()).filter(Boolean);
const result = {schemaVersion: 1, generatedAt: new Date().toISOString(), sourceVersion: contracts.sourceVersion, scope, ...verifyContracts(figma, contracts, scope)};
const output = resolve(args.output ?? resolve(requireArg(args, 'run'), 'semantic-verification.json'));
await writeJson(output, result);
process.stdout.write(`${JSON.stringify({output, status: result.status, assertions: result.assertions.length, failed: result.assertions.filter((entry) => !entry.passed).length})}\n`);
if (result.status !== 'VERIFIED') process.exitCode = 1;
