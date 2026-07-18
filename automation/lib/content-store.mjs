import {access, mkdir, writeFile} from 'node:fs/promises';
import {dirname, relative, resolve} from 'node:path';
import {hashObject, sha256Text} from './hashing.mjs';
import {readJson, writeJson} from './io.mjs';

export async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function isArtifactReference(value) {
  return Boolean(value?.artifactReference?.path && value?.artifactReference?.sha256);
}

export async function readResolvedJson(path, seen = new Set()) {
  const absolute = resolve(path);
  if (seen.has(absolute)) throw new Error(`Circular artifact reference: ${absolute}`);
  seen.add(absolute);
  const value = await readJson(absolute);
  if (!isArtifactReference(value)) return value;
  const target = resolve(dirname(absolute), value.artifactReference.path);
  const resolved = await readResolvedJson(target, seen);
  const actualHash = hashObject(resolved);
  if (actualHash !== value.artifactReference.sha256) {
    throw new Error(`Artifact reference hash mismatch: expected ${value.artifactReference.sha256}, got ${actualHash}`);
  }
  return resolved;
}

export async function putJson(cacheRoot, kind, value) {
  const sha256 = hashObject(value);
  const path = resolve(cacheRoot, kind, sha256.slice(0, 2), `${sha256}.json`);
  if (!(await exists(path))) await writeJson(path, value);
  return {path, sha256};
}

export async function putBytes(cacheRoot, bytes, extension = 'bin') {
  const sha256 = sha256Text(bytes);
  const path = resolve(cacheRoot, 'assets', 'sha256', sha256.slice(0, 2), `${sha256}.${extension}`);
  if (!(await exists(path))) {
    await mkdir(dirname(path), {recursive: true});
    await writeFile(path, bytes);
  }
  return {path, sha256};
}

export async function writeArtifactReference(output, target, kind, metadata = {}) {
  const value = await readJson(target);
  const sha256 = hashObject(value);
  const reference = {
    schemaVersion: 1,
    artifactReference: {
      kind,
      sha256,
      path: relative(dirname(resolve(output)), resolve(target)).replaceAll('\\', '/'),
    },
    ...metadata,
  };
  await writeJson(output, reference);
  return reference;
}
