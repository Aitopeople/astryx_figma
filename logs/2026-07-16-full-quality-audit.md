# Full Figma quality audit

Date: 2026-07-16  
Baseline: `@astryxdesign/core@0.1.6`  
Figma file: `4YmLJEV002eWzvKLVQru5f`  
Run: `automation/runs/2026-07-16-full-quality-audit/`

The audit covered all 81 pages and used a curated, source-backed plan instead of the noisy identity-level generated diff. The user approved plan hash `8005afd8df6f4112eb8e3bddc99e084a6d50468fbbd1c5dedf4e091a58be9274` before any Figma writes.

## Verified changes

- EmptyState: replaced the invalid `360×10` overflow frame with Normal `360×208` and Compact `360×156` variants; added official anatomy and `title`, `description`, `icon`, `actions`, `isCompact` properties.
- NavIcon: removed the invented label and `Label` property; restored the token-bound `32×32` circle with a persistent `16×16` icon.
- Link: removed the `180×32` fixed frame and internal padding; restored body/normal/accent Hug sizing at `111×20` for the sample text.
- Blockquote: added one `500×48` source-backed component with a 2px emphasized start border, 16px inset, 8px cite gap, and `children`/`cite` properties.
- Carousel: replaced the raw showcase wrapper with one `500×100` component, a clipped scroller, four `200×100` cards, gap 8, and an unclipped overlay control.

All nine approved operations passed independent readback and screenshot assertions. Final invariants: broken instances 0, active placeholders 0, coverage complete.

## Deferred

- Spinner was not modified because CLI metadata lists `sm | md | lg`, while the installed package source also defines `xl`.
- AppShell remains documentation/example-only because the responsive shell has no official intrinsic fixed size.
- Team-library publishing remains manual.
