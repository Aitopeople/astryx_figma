import {resolve} from 'node:path';
import {assertArtifact} from '../lib/artifact-validation.mjs';
import {parseArgs, readJson, requireArg} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const kind = requireArg(args, 'kind');
const path = resolve(requireArg(args, 'file'));
const value = await readJson(path);
await assertArtifact(kind, value);
process.stdout.write(`${JSON.stringify({valid: true, kind, path})}\n`);
