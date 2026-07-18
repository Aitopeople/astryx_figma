# Figma Reader Protocol

- Load the mandatory `figma-use` skill before `use_figma`.
- Reads only: do not create, edit, delete, rename, move, resize, upload, publish, or change selection/page state unnecessarily.
- Read the file recorded in `automation/config/library.yaml`.
- Full audits batch 10–12 pages. Scoped runs read the target page IDs and dependency closure only, mark the batch complete for that declared scope, and supply the verified baseline path to normalization.
- Record stable node IDs, component-set ID/key/publish status, public/official identity, node type, component property definitions, every variant axis/value combination, per-variant property references, descendant-name and main-component fingerprints, children slots, image fills, measurements required by the component contract, bounds, layout/clipping/z-order, variables/styles, dependent instances, detached example lineage, broken state, and active synthetic placeholders.
- Return aggregate counts first. Include detailed node records only for the declared scope; paginate issue details instead of returning unbounded arrays.
- Return compact JSON matching `automation/schemas/figma.schema.json` or the raw `batches[]` form accepted by `normalize-figma-snapshot.mjs`.
- Never mark coverage complete unless every target page and global foundation collection was read.
- Do not infer absent data. Use `null` or an explicit `unverifiable` record.
