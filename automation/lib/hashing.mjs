import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {canonicalStringify} from './canonical-json.mjs';

export function sha256Text(text) {
  return createHash('sha256').update(text).digest('hex');
}

export function hashObject(value, omittedKeys = []) {
  const omitted = new Set(omittedKeys);
  const filtered = Object.fromEntries(
    Object.entries(value).filter(([key]) => !omitted.has(key)),
  );
  return sha256Text(canonicalStringify(filtered));
}

export async function sha256File(path) {
  return sha256Text(await readFile(path));
}

export function snapshotHash(snapshot) {
  return snapshot?.integrity?.merkleRoot ?? hashObject(snapshot);
}
