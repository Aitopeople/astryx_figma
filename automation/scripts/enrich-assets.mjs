import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
import {resolve} from 'node:path';
import {parseArgs, readJson, readJsonYaml, requireArg, writeJson} from '../lib/io.mjs';
import {exists, putBytes, putJson, readResolvedJson, writeArtifactReference} from '../lib/content-store.mjs';
import {sha256Text} from '../lib/hashing.mjs';

export function imageDimensions(bytes) {
  if (bytes.length >= 24 && bytes.subarray(1, 4).toString('ascii') === 'PNG') {
    return {width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), format: 'png'};
  }
  if (bytes.length >= 10 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'))) {
    return {width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8), format: 'gif'};
  }
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP') {
    const chunk = bytes.subarray(12, 16).toString('ascii');
    if (chunk === 'VP8X' && bytes.length >= 30) {
      const width = 1 + bytes.readUIntLE(24, 3);
      const height = 1 + bytes.readUIntLE(27, 3);
      return {width, height, format: 'webp'};
    }
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      const marker = bytes[offset + 1];
      const length = bytes.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return {width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5), format: 'jpeg'};
      }
      if (length < 2) break;
      offset += 2 + length;
    }
  }
  return null;
}

function isPrivateAddress(address) {
  const normalized = address.toLowerCase().replace(/^::ffff:/, '');
  if (normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  if (isIP(normalized) !== 4) return false;
  const [a, b] = normalized.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
}

export async function assertSafeAssetUrl(value, resolver = lookup, allowedHosts = null) {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('Only HTTPS asset URLs are allowed');
  if (url.username || url.password) throw new Error('Asset URLs may not contain credentials');
  if (url.port && url.port !== '443') throw new Error('Asset URLs may not use a non-HTTPS port');
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost')) throw new Error('Local asset hosts are blocked');
  if (allowedHosts && !allowedHosts.includes(url.hostname)) throw new Error(`Asset host is not allowlisted: ${url.hostname}`);
  const literal = isIP(url.hostname);
  const addresses = literal ? [{address: url.hostname}] : await resolver(url.hostname, {all: true, verbatim: true});
  if (!addresses.length || addresses.some(({address}) => isPrivateAddress(address))) throw new Error('Private, loopback, or link-local asset hosts are blocked');
  return url;
}

async function mapConcurrent(values, concurrency, mapper) {
  const result = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      result[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({length: Math.min(concurrency, values.length)}, worker));
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const input = resolve(requireArg(args, 'official'));
  const output = resolve(args.output ?? input);
  const official = await readResolvedJson(input);
  const config = await readJsonYaml(resolve(args.config ?? resolve(import.meta.dirname, '../config/library.yaml')));
  const cacheRoot = resolve(args['cache-root'] ?? resolve(import.meta.dirname, '../cache'));
  const uniqueUrls = [...new Set((official.assets ?? []).map((entry) => entry.url).filter((url) => /^https?:/.test(url)))];
  const metadata = new Map(await mapConcurrent(uniqueUrls, Number(args.concurrency ?? 6), async (url) => {
    const urlCachePath = resolve(cacheRoot, 'assets', 'urls', `${sha256Text(`${official.sourceVersion}:${url}`)}.json`);
    if (args.refresh !== true && await exists(urlCachePath)) return [url, await readJson(urlCachePath)];
    try {
      const safeUrl = await assertSafeAssetUrl(url, lookup, config.assetFetch.allowedHosts);
      const response = await fetch(safeUrl, {signal: AbortSignal.timeout(Number(args.timeout ?? 20000)), redirect: 'error'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const intrinsic = imageDimensions(bytes);
      const stored = await putBytes(cacheRoot, bytes, intrinsic?.format ?? 'bin');
      const record = {
        sha256: stored.sha256,
        byteLength: bytes.length,
        contentType: response.headers.get('content-type'),
        intrinsic,
        cachePath: stored.path,
        retrievedAt: new Date().toISOString(),
        error: null,
      };
      await writeJson(urlCachePath, record);
      return [url, record];
    } catch (error) {
      const record = {sha256: null, byteLength: null, contentType: null, intrinsic: null, cachePath: null, retrievedAt: new Date().toISOString(), error: error.message};
      return [url, record];
    }
  }));
  official.assets = official.assets.map((entry) => ({...entry, ...metadata.get(entry.url)}));
  const uniqueFailures = [...new Map(
    official.assets
      .filter((entry) => entry.error && !entry.expectedUnavailable)
      .map((entry) => [entry.url, {url: entry.url, error: entry.error}]),
  ).values()];
  official.assetCollection = {
    complete: uniqueFailures.length === 0,
    uniqueUrls: uniqueUrls.length,
    expectedUnavailable: [...new Set(official.assets.filter((entry) => entry.error && entry.expectedUnavailable).map((entry) => entry.url))],
    failures: uniqueFailures,
  };
  const cached = await putJson(cacheRoot, 'official-enriched', official);
  if (args.materialize === true) await writeJson(output, official);
  else await writeArtifactReference(output, cached.path, 'official', {sourceVersion: official.sourceVersion, enriched: true});
  process.stdout.write(`${JSON.stringify({output, ...official.assetCollection})}\n`);
  if (!official.assetCollection.complete && args.strict === true) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
const modulePath = resolve(new URL(import.meta.url).pathname.replace(/^\/(.:)/, '$1'));
if (invokedPath === modulePath) await main();
