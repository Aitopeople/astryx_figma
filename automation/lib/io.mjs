import {mkdir, readFile, rename, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {prettyCanonical} from './canonical-json.mjs';

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function readJsonYaml(path) {
  return readJson(path);
}

export async function writeJson(path, value) {
  const absolute = resolve(path);
  await mkdir(dirname(absolute), {recursive: true});
  const temporary = `${absolute}.tmp-${process.pid}`;
  await writeFile(temporary, prettyCanonical(value), 'utf8');
  await rename(temporary, absolute);
}

export function parseArgs(argv) {
  const result = {_: []};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith('--')) {
      result._.push(value);
      continue;
    }
    const [rawKey, inline] = value.slice(2).split('=', 2);
    if (inline !== undefined) {
      result[rawKey] = inline;
    } else if (argv[index + 1] && !argv[index + 1].startsWith('--')) {
      result[rawKey] = argv[index + 1];
      index += 1;
    } else {
      result[rawKey] = true;
    }
  }
  return result;
}

export function requireArg(args, key) {
  if (!args[key]) throw new Error(`Missing required argument --${key}`);
  return args[key];
}
