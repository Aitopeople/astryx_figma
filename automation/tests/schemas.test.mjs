import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {assertSchema, validateSchema} from '../lib/schema-validation.mjs';

async function schema(name) {
  return JSON.parse(await readFile(resolve(import.meta.dirname, '../schemas', name), 'utf8'));
}

test('official and Figma artifacts validate against versioned schemas', async () => {
  const officialSchema = await schema('official.schema.json');
  const figmaSchema = await schema('figma.schema.json');
  const official = {
    schemaVersion: 1,
    sourceVersion: '0.1.6',
    generatedAt: '2026-07-16T00:00:00.000Z',
    inventory: {components: 1, pageTemplates: 0, blockTemplates: 1},
    components: [{name: 'Button', props: [], evidence: ['cli']}],
    templates: [{id: 'ButtonShowcase', type: 'block'}],
    tokens: {},
    evidence: [],
  };
  const figma = {
    schemaVersion: 1,
    fileKey: 'file',
    generatedAt: '2026-07-16T00:00:00.000Z',
    coverage: {complete: true, batches: []},
    inventory: {},
    components: [{name: 'Button', nodeId: '1:1'}],
    pages: [],
    variables: [],
    styles: [],
  };
  assert.doesNotThrow(() => assertSchema(officialSchema, official));
  assert.doesNotThrow(() => assertSchema(figmaSchema, figma));
});

test('unknown schema versions fail closed', async () => {
  const officialSchema = await schema('official.schema.json');
  const errors = validateSchema(officialSchema, {schemaVersion: 2});
  assert.ok(errors.some((error) => error.includes('schemaVersion')));
  assert.ok(errors.some((error) => error.includes('sourceVersion')));
});
