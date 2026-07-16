import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {parseArgs, readJson, requireArg} from '../lib/io.mjs';
import {assertArtifact} from '../lib/artifact-validation.mjs';

const args = parseArgs(process.argv.slice(2));
const root = resolve(import.meta.dirname, '../..');
const runDir = resolve(requireArg(args, 'run'));
const [official, after, verification] = await Promise.all([
  readJson(resolve(runDir, 'official.json')),
  readJson(resolve(runDir, 'figma-after.json')),
  readJson(resolve(runDir, 'verification.json')),
]);
if (verification.status !== 'VERIFIED') throw new Error('Documentation status can only be updated from a VERIFIED run');
await assertArtifact('official', official);
await assertArtifact('figma', after);
await assertArtifact('verification', verification);

const start = '<!-- AUTOMATION:STATUS:START -->';
const end = '<!-- AUTOMATION:STATUS:END -->';
const generated = [
  start,
  `- Figma file: \`${after.fileName ?? 'astryx_design_system'}\` (\`${after.fileKey}\`).`,
  `- Verified baseline: **Astryx v${official.sourceVersion}** (exact core + CLI match).`,
  `- Official inventory: ${official.inventory.components} components, ${official.inventory.pageTemplates} page templates, ${official.inventory.blockTemplates} block templates.`,
  `- Figma integrity: ${after.inventory.pages} pages, ${after.inventory.components} components, ${after.inventory.componentSets} component sets, ${after.inventory.brokenInstances} broken instances.`,
  `- Foundations: ${after.inventory.variables} variables and ${after.inventory.styles} local styles in the normalized snapshot.`,
  `- Latest verified automation run: \`${verification.runId}\` / plan \`${verification.planHash}\`.`,
  '- Figma team-library publishing remains manual.',
  end,
].join('\n');

async function update(path) {
  const content = await readFile(path, 'utf8');
  const pattern = new RegExp(`${start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  if (!pattern.test(content)) throw new Error(`${path} is missing automation status markers`);
  const next = content.replace(pattern, generated);
  if (args.check === true) {
    if (next !== content) throw new Error(`${path} status is stale`);
  } else {
    await writeFile(path, next, 'utf8');
  }
}

await update(resolve(root, 'README.md'));
await update(resolve(root, 'checkpoint.md'));
process.stdout.write(`${JSON.stringify({status: args.check === true ? 'current' : 'updated'})}\n`);
