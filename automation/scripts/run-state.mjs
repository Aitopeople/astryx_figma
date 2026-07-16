import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg, writeJson} from '../lib/io.mjs';
import {transitionRun} from '../lib/state-machine.mjs';

const args = parseArgs(process.argv.slice(2));
const runDir = resolve(requireArg(args, 'run'));
const path = resolve(runDir, 'run.json');
const command = args._[0];

if (command === 'init') {
  const now = new Date().toISOString();
  const run = {
    schemaVersion: 1,
    runId: args['run-id'] ?? runDir.split(/[\\/]/).filter(Boolean).at(-1),
    status: 'COLLECTING',
    createdAt: now,
    updatedAt: now,
    history: [],
  };
  await writeJson(path, run);
  process.stdout.write(`${JSON.stringify({path, status: run.status})}\n`);
} else if (command === 'transition') {
  const run = await readJson(path);
  const next = transitionRun(run, requireArg(args, 'to'), {reason: args.reason ?? 'coordinator'});
  await writeJson(path, next);
  process.stdout.write(`${JSON.stringify({path, status: next.status})}\n`);
} else if (command === 'show') {
  const run = await readJson(path);
  process.stdout.write(`${JSON.stringify(run)}\n`);
} else {
  throw new Error('Usage: run-state.mjs <init|transition|show> --run <directory> [--to STATUS]');
}
