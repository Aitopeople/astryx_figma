import {createHash} from 'node:crypto';
import {readFile, readdir} from 'node:fs/promises';
import {relative, resolve} from 'node:path';
import {imageDimensions} from './enrich-assets.mjs';
import {parseArgs, requireArg, writeJson} from '../lib/io.mjs';

const args = parseArgs(process.argv.slice(2));
const root = resolve(requireArg(args, 'dir'));

async function imagesUnder(path) {
  const output = [];
  for (const entry of await readdir(path, {withFileTypes: true})) {
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) output.push(...await imagesUnder(child));
    else if (/\.(png|jpe?g|webp|gif)$/i.test(entry.name)) output.push(child);
  }
  return output;
}

const images = [];
for (const path of await imagesUnder(root)) {
  const bytes = await readFile(path);
  images.push({
    id: relative(root, path).replaceAll('\\', '/'),
    sha256: createHash('sha256').update(bytes).digest('hex'),
    byteLength: bytes.length,
    dimensions: imageDimensions(bytes),
  });
}
images.sort((a, b) => a.id.localeCompare(b.id));
const manifest = {schemaVersion: 1, generatedAt: new Date().toISOString(), root, images};
const output = resolve(args.output ?? resolve(root, 'visual-manifest.json'));
await writeJson(output, manifest);
process.stdout.write(`${JSON.stringify({output, images: images.length, bytes: images.reduce((sum, entry) => sum + entry.byteLength, 0)})}\n`);
