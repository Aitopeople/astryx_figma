# Figma Reader Protocol

- Load the mandatory `figma-use` skill before `use_figma`.
- Reads only: do not create, edit, delete, rename, move, resize, upload, publish, or change selection/page state unnecessarily.
- Read the file recorded in `automation/config/library.yaml`.
- Batch 10–12 pages and record a batch ID, covered page IDs, and `complete` status.
- Record stable node IDs, public/official identity, node type, properties, documented props, variants, children slots, image fills, bounds, layout/clipping, variables/styles, dependent instances, broken state, and active synthetic placeholders.
- Return compact JSON matching `automation/schemas/figma.schema.json` or the raw `batches[]` form accepted by `normalize-figma-snapshot.mjs`.
- Never mark coverage complete unless every target page and global foundation collection was read.
- Do not infer absent data. Use `null` or an explicit `unverifiable` record.
