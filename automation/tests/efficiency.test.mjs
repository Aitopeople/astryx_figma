import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdir, mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {promisify} from 'node:util';
import {putJson, readResolvedJson, writeArtifactReference} from '../lib/content-store.mjs';
import {verifyContracts} from '../lib/semantic-verification.mjs';
import {readJson, writeJson} from '../lib/io.mjs';

const execFileAsync = promisify(execFile);
const root = resolve(import.meta.dirname, '../..');

test('content-addressed JSON references resolve without run-local duplication', async () => {
  const dir = await mkdtemp(resolve(tmpdir(), 'astryx-cache-'));
  const value = {schemaVersion: 1, sourceVersion: '0.1.6', payload: ['stable']};
  const stored = await putJson(resolve(dir, 'cache'), 'official', value);
  const reference = resolve(dir, 'run', 'official.json');
  await writeArtifactReference(reference, stored.path, 'official', {cacheHit: true});
  assert.deepEqual(await readResolvedJson(reference), value);
  assert.equal((await readJson(reference)).cacheHit, true);
});

test('scoped Figma normalization merges target pages with a verified baseline and emits a Merkle root', async () => {
  const dir = await mkdtemp(resolve(tmpdir(), 'astryx-scope-'));
  const baselinePath = resolve(dir, 'baseline.json');
  const inputPath = resolve(dir, 'selector.json');
  const outputPath = resolve(dir, 'after.json');
  const base = {
    schemaVersion: 1, fileKey: 'file', generatedAt: '2026-07-18T00:00:00Z', coverage: {complete: true, batches: []}, inventory: {},
    components: [{name: 'Selector', nodeId: '1:1', page: 'Selector', revision: 1}, {name: 'Other', nodeId: '2:1', page: 'Other'}],
    pages: [{name: 'Selector', nodeId: '10:1'}, {name: 'Other', nodeId: '20:1'}], variables: [], styles: [], instances: [], assets: [], placeholders: [],
  };
  const partial = {
    schemaVersion: 1, fileKey: 'file', generatedAt: '2026-07-18T01:00:00Z', coverage: {complete: true, batches: []},
    components: [{name: 'Selector', nodeId: '1:1', page: 'Selector', revision: 2}], pages: [{name: 'Selector', nodeId: '10:1'}], variables: [], styles: [], instances: [], assets: [], placeholders: [],
  };
  await writeJson(baselinePath, base); await writeJson(inputPath, partial);
  await execFileAsync(process.execPath, [resolve(root, 'automation/scripts/normalize-figma-snapshot.mjs'), '--input', inputPath, '--output', outputPath, '--baseline', baselinePath, '--scope', 'Selector'], {cwd: root, windowsHide: true});
  const merged = await readJson(outputPath);
  assert.equal(merged.coverage.mode, 'scoped');
  assert.equal(merged.coverage.complete, true);
  assert.equal(merged.components.find((entry) => entry.name === 'Selector').revision, 2);
  assert.ok(merged.components.some((entry) => entry.name === 'Other'));
  assert.match(merged.integrity.merkleRoot, /^[a-f0-9]{64}$/);
});

test('semantic contracts fail incomplete variant and property-reference coverage', () => {
  const figma = {components: [{name: 'Widget', nodeId: '1:1', variants: [{nodeId: '1:2', values: {size: 'sm'}}], componentPropertyDefinitions: {'open#1:0': {type: 'BOOLEAN'}}, propertyReferences: []}], pages: []};
  const contracts = {contracts: {Widget: {expectedVariantCount: 2, variantAxes: {size: ['sm', 'md']}, requiredProperties: ['open'], requiredPropertyReferences: ['open']}}};
  const result = verifyContracts(figma, contracts, ['Widget']);
  assert.equal(result.status, 'FAILED');
  assert.ok(result.assertions.some((entry) => entry.code === 'variant.cartesianCoverage' && !entry.passed));
  assert.ok(result.assertions.some((entry) => entry.code === 'property.referenceCoverage' && !entry.passed));
});

test('capability preflight blocks known incompatible Figma mechanics', async () => {
  const dir = await mkdtemp(resolve(tmpdir(), 'astryx-capability-'));
  const planPath = resolve(dir, 'plan.json');
  await writeJson(planPath, {operations: [{id: 'op-1', mechanics: ['variantSpecificExposedInstanceSwapDefault']}]});
  await assert.rejects(
    () => execFileAsync(process.execPath, [resolve(root, 'automation/scripts/validate-capabilities.mjs'), '--plan', planPath], {cwd: root, windowsHide: true}),
  );
});

test('visual manifests reuse byte-identical screenshots and queue only changes', async () => {
  const dir = await mkdtemp(resolve(tmpdir(), 'astryx-visual-'));
  const beforeDir = resolve(dir, 'before'); const afterDir = resolve(dir, 'after');
  await mkdir(beforeDir); await mkdir(afterDir);
  const png = (width) => { const bytes = Buffer.alloc(24); bytes.writeUInt8(0x89, 0); bytes.write('PNG', 1, 'ascii'); bytes.writeUInt32BE(width, 16); bytes.writeUInt32BE(20, 20); return bytes; };
  await writeFile(resolve(beforeDir, 'same.png'), png(20)); await writeFile(resolve(afterDir, 'same.png'), png(20));
  await writeFile(resolve(beforeDir, 'changed.png'), png(20)); await writeFile(resolve(afterDir, 'changed.png'), png(21));
  const beforeManifest = resolve(dir, 'before.json'); const afterManifest = resolve(dir, 'after.json'); const diffPath = resolve(dir, 'diff.json');
  await execFileAsync(process.execPath, [resolve(root, 'automation/scripts/build-visual-manifest.mjs'), '--dir', beforeDir, '--output', beforeManifest], {cwd: root, windowsHide: true});
  await execFileAsync(process.execPath, [resolve(root, 'automation/scripts/build-visual-manifest.mjs'), '--dir', afterDir, '--output', afterManifest], {cwd: root, windowsHide: true});
  await execFileAsync(process.execPath, [resolve(root, 'automation/scripts/compare-visual-manifests.mjs'), '--baseline', beforeManifest, '--current', afterManifest, '--run', dir, '--output', diffPath], {cwd: root, windowsHide: true});
  const diff = await readJson(diffPath);
  assert.deepEqual(diff.summary, {reused: 1, changed: 1, added: 0, missing: 0});
  assert.equal(diff.reviewQueue[0].id, 'changed.png');
});
