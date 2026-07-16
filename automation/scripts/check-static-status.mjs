import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {readJson} from '../lib/io.mjs';

const root = resolve(import.meta.dirname, '../..');
const packageJson = await readJson(resolve(root, 'package.json'));
const coreVersion = packageJson.dependencies?.['@astryxdesign/core'];
const cliVersion = packageJson.devDependencies?.['@astryxdesign/cli'];
if (!/^\d+\.\d+\.\d+$/.test(coreVersion ?? '') || coreVersion !== cliVersion) {
  throw new Error(`Core and CLI must use the same exact semver; core=${coreVersion}, cli=${cliVersion}`);
}

const start = '<!-- AUTOMATION:STATUS:START -->';
const end = '<!-- AUTOMATION:STATUS:END -->';
for (const filename of ['README.md', 'checkpoint.md']) {
  const content = await readFile(resolve(root, filename), 'utf8');
  const begin = content.indexOf(start);
  const finish = content.indexOf(end);
  if (begin < 0 || finish <= begin) throw new Error(`${filename} has invalid automation status markers`);
  const block = content.slice(begin, finish);
  if (!block.includes(`v${coreVersion}`)) throw new Error(`${filename} automation status is stale; expected v${coreVersion}`);
}
process.stdout.write(`${JSON.stringify({valid: true, version: coreVersion})}\n`);
