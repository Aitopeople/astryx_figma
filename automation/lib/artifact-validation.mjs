import {resolve} from 'node:path';
import {readJson} from './io.mjs';
import {assertSchema} from './schema-validation.mjs';

const SCHEMAS = Object.freeze({
  official: 'official.schema.json',
  figma: 'figma.schema.json',
  plan: 'change-plan.schema.json',
  approval: 'approval.schema.json',
  verification: 'verification.schema.json',
});

export async function assertArtifact(kind, value) {
  const filename = SCHEMAS[kind];
  if (!filename) throw new Error(`Unknown artifact kind: ${kind}`);
  const schema = await readJson(resolve(import.meta.dirname, '../schemas', filename));
  assertSchema(schema, value, kind);
}
