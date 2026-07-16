import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {parseArgs, readJson, requireArg} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const runDir = resolve(requireArg(args, 'run'));
const [official, diff, plan] = await Promise.all([
  readJson(resolve(runDir, 'official.json')),
  readJson(resolve(runDir, 'diff.json')),
  readJson(resolve(runDir, 'plan.json')),
]);
const verification = await readJson(resolve(runDir, 'verification.json')).catch(() => null);
const output = resolve(args.output ?? resolve(runDir, 'report.md'));
const riskCounts = Object.fromEntries(['low', 'medium', 'high'].map((risk) => [risk, plan.operations.filter((entry) => entry.risk === risk).length]));
const lines = [
  `# Astryx Figma Automation Run ${plan.runId}`,
  '',
  `- Source version: ${official.sourceVersion}`,
  `- Plan hash: \`${plan.planHash}\``,
  `- Verification: ${verification?.status ?? 'NOT_RUN'}`,
  `- Inventory: ${official.inventory.components} components, ${official.inventory.pageTemplates} page templates, ${official.inventory.blockTemplates} block templates`,
  `- Diff: ${Object.entries(diff.summary).map(([key, value]) => `${key} ${value}`).join(', ')}`,
  `- Operations: low ${riskCounts.low}, medium ${riskCounts.medium}, high ${riskCounts.high}`,
  '',
  '## Operations',
  '',
  ...plan.operations.flatMap((operation) => [
    `- \`${operation.id}\` ${operation.type} — ${operation.target.identity} (${operation.risk})`,
  ]),
  '',
  '## Verification',
  '',
  verification
    ? `Global invariants: broken instances ${verification.globalAssertions.brokenInstances}, active placeholders ${verification.globalAssertions.activePlaceholders}, complete coverage ${verification.globalAssertions.coverageComplete}.`
    : 'Verification has not run. Do not claim the library is synchronized.',
  '',
  'Figma team-library publishing remains manual.',
  '',
];
await mkdir(dirname(output), {recursive: true});
await writeFile(output, lines.join('\n'), 'utf8');
process.stdout.write(`${JSON.stringify({output})}\n`);
