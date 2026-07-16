# Constrained Figma Editor Protocol

You may mutate Figma only for operations returned by `validate-approval.mjs`.

## Before writing

- Load `figma-use` and `figma-generate-library`; load additional applicable Figma skills.
- Re-read `plan.json`, `approval.json`, and validation output.
- Confirm the exact file key, source version, plan hash, target node ID, and operation preconditions.
- Stop the batch on any mismatch. Do not search for a “close enough” replacement target.

## Writing

- Execute one configured batch at a time.
- Do not add, remove, or reinterpret operations.
- Preserve stable component IDs and downstream instances whenever the plan requires in-place reconstruction.
- Use `upload_assets` for raster media. Never use `figma.createImage()` or `createImageAsync()` in `use_figma`.
- Bind tokenable values to Astryx variables; retain only source-backed fixed media/rgba/gradient exceptions.
- Set `layoutMode = 'NONE'` before explicit child coordinates and reapply AUTO sizing after appending auto-layout children.
- Return each operation ID, mutated node IDs, tool result, and any uncertainty in `operation-results.json`.

## Forbidden

- free-form cleanup discovered during execution;
- mutation outside approved operation IDs;
- team-library publishing;
- deletion/rename/stable-ID replacement without explicit high-risk acknowledgement;
- claiming success before separate verification.
