const MEDIA_URL = /https?:\/\/[^'"`\s)]+/g;
const MEDIA_EXTENSION = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

function numericProp(source, name) {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*(?:\\{)?([0-9]+(?:\\.[0-9]+)?)`));
  return match ? Number(match[1]) : null;
}

function stringProp(source, name) {
  const match = source.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`));
  return match?.[1] ?? null;
}

export function extractAssetReferences(templates, sourceVersion) {
  const records = [];
  const seen = new Set();
  for (const template of templates) {
    const source = template.source ?? '';
    for (const match of source.matchAll(MEDIA_URL)) {
      const url = match[0];
      if (!MEDIA_EXTENSION.test(url)) continue;
      const key = `${template.id}|${url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const context = source.slice(Math.max(0, match.index - 240), Math.min(source.length, match.index + url.length + 320));
      const width = numericProp(context, 'width');
      const height = numericProp(context, 'height');
      records.push({
        templateId: template.id,
        url,
        expectedUnavailable: /(?:does-not-exist|invalid|broken|missing)/i.test(url),
        intrinsic: null,
        rendered: width || height ? {width, height} : null,
        fit: stringProp(context, 'fit') ?? stringProp(context, 'objectFit'),
        crop: null,
        radius: numericProp(context, 'borderRadius'),
        shape: stringProp(context, 'shape'),
        scrim: stringProp(context, 'scrim'),
        evidence: [`cli:template:${template.id}@${sourceVersion}`],
      });
    }
  }
  return records.sort((a, b) => `${a.templateId}:${a.url}`.localeCompare(`${b.templateId}:${b.url}`));
}
