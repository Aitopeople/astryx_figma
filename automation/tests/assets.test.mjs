import test from 'node:test';
import assert from 'node:assert/strict';
import {extractAssetReferences} from '../lib/asset-references.mjs';
import {assertSafeAssetUrl, imageDimensions} from '../scripts/enrich-assets.mjs';

test('asset extraction ignores links and records placed media behavior', () => {
  const records = extractAssetReferences([{
    id: 'Example',
    source: '<a href="https://example.com/docs">Docs</a><img src="https://example.com/image.png" width={320} height={180} objectFit="cover" />',
  }], '0.1.6');
  assert.equal(records.length, 1);
  assert.equal(records[0].url, 'https://example.com/image.png');
  assert.deepEqual(records[0].rendered, {width: 320, height: 180});
  assert.equal(records[0].fit, 'cover');
});

test('intentional missing fallback images are classified separately', () => {
  const [record] = extractAssetReferences([{
    id: 'Fallback',
    source: '<img src="https://example.com/does-not-exist-primary.jpg" />',
  }], '0.1.6');
  assert.equal(record.expectedUnavailable, true);
});

test('PNG intrinsic dimensions are read from original bytes', () => {
  const bytes = Buffer.alloc(24);
  bytes.writeUInt8(0x89, 0);
  bytes.write('PNG', 1, 'ascii');
  bytes.writeUInt32BE(640, 16);
  bytes.writeUInt32BE(420, 20);
  assert.deepEqual(imageDimensions(bytes), {width: 640, height: 420, format: 'png'});
});

test('asset enrichment rejects SSRF targets before fetch', async () => {
  await assert.rejects(() => assertSafeAssetUrl('http://example.com/image.png'), /HTTPS/);
  await assert.rejects(() => assertSafeAssetUrl('https://localhost/image.png'), /Local asset hosts/);
  await assert.rejects(
    () => assertSafeAssetUrl('https://untrusted.example/image.png', async () => [{address: '8.8.8.8'}], ['assets.example']),
    /allowlisted/,
  );
  await assert.rejects(
    () => assertSafeAssetUrl('https://assets.example/image.png', async () => [{address: '169.254.169.254'}]),
    /blocked/,
  );
  await assert.doesNotReject(
    () => assertSafeAssetUrl('https://assets.example/image.png', async () => [{address: '8.8.8.8'}], ['assets.example']),
  );
});
