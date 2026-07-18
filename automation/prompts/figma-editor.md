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
- Return compact mutation summaries: operation ID, top-level mutated/created roots, descendant counts, result digest, assertions, warnings, and uncertainty. Return leaf IDs only when they are not contained by a returned root, are needed for rollback, or a failure requires targeted diagnosis. Do not stream thousands of descendant IDs into conversation.
- Run `validate-capabilities.mjs` before writing and merge its required assertion augmentations into the operation result.
- Treat one public component set and its complete approved variant matrix as one transaction; never repair only the representative variant when the approved contract covers the set.

## Forbidden

- free-form cleanup discovered during execution;
- mutation outside approved operation IDs;
- team-library publishing;
- deletion/rename/stable-ID replacement without explicit high-risk acknowledgement;
- claiming success before separate verification.
