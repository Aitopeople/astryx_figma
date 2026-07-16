import test from 'node:test';
import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {promisify} from 'node:util';
import {readJson, writeJson} from '../lib/io.mjs';

const execFileAsync = promisify(execFile);
const root = resolve(import.meta.dirname, '../..');

async function run(script, args) {
  await execFileAsync(process.execPath, [resolve(root, 'automation/scripts', script), ...args], {
    cwd: root,
    windowsHide: true,
  });
}

test('semantic diff and plan are deterministic for identical snapshots', async () => {
  const dir = await mkdtemp(resolve(tmpdir(), 'astryx-diff-'));
  const officialPath = resolve(dir, 'official.json');
  const figmaPath = resolve(dir, 'figma.json');
  const official = {
    schemaVersion: 1,
    sourceVersion: '0.1.6',
    generatedAt: '2026-07-16T00:00:00.000Z',
    inventory: {components: 1, pageTemplates: 0, blockTemplates: 0},
    components: [{name: 'Button', props: [{name: 'label', type: 'string'}, {name: 'onClick', type: '() => void'}], evidence: ['cli:Button']}],
    templates: [],
    tokens: {},
    evidence: [],
  };
  const figma = {
    schemaVersion: 1,
    fileKey: 'file',
    generatedAt: '2026-07-16T00:00:00.000Z',
    coverage: {complete: true, batches: []},
    inventory: {},
    components: [{name: 'Button', nodeId: '1:1', documentedProps: [{name: 'label', type: 'string'}]}],
    pages: [],
    variables: [],
    styles: [],
  };
  await writeJson(officialPath, official);
  await writeJson(figmaPath, figma);
  await run('diff-library.mjs', ['--official', officialPath, '--figma', figmaPath, '--run', dir]);
  const diff = await readJson(resolve(dir, 'diff.json'));
  assert.equal(diff.summary.missing, 1);
  assert.equal(diff.differences[0].identity, 'component:Button/prop:onClick');
  await run('build-change-plan.mjs', ['--diff', resolve(dir, 'diff.json'), '--run', dir, '--run-id', 'run-1']);
  const first = await readJson(resolve(dir, 'plan.json'));
  await run('build-change-plan.mjs', ['--diff', resolve(dir, 'diff.json'), '--run', dir, '--run-id', 'run-1']);
  const second = await readJson(resolve(dir, 'plan.json'));
  assert.deepEqual(second, first);
  assert.equal(first.operations[0].type, 'ADD_PROP_ROW');
  assert.equal(first.operations[0].risk, 'low');
});
