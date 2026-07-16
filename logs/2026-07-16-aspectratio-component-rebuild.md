# AspectRatio Official Component Rebuild

Date: 2026-07-16
Baseline: `@astryxdesign/core@0.1.6`, `@astryxdesign/cli@0.1.6`
Figma file: `4YmLJEV002eWzvKLVQru5f`

## Source checks

- Cross-checked docs MCP `AspectRatio` against `npx astryx component AspectRatio --json`.
- Verified official props: required `ratio`, optional `shape='rectangle' | 'ellipse'`, optional `fit='cover' | 'contain' | 'center'`, required `children`, and `xstyle`.
- Verified official templates: `AspectRatioShowcase`, `AspectRatioCircleImage`, `AspectRatioImageGallery`, `AspectRatioSquareImage`, `AspectRatioWidescreen`, and `AspectRatioWithSkeleton`.
- Downloaded the three image URLs referenced by the official templates. Source dimensions were 900x900, 1440x810, and 900x600.

## Figma changes

- Rebuilt component set `883:14` as six variants: ratio `1:1 | 4:3 | 16:9` by shape `rectangle | ellipse`.
- Set official showcase sizes to equal 120px height: 120x120, 160x120, and 213.333x120.
- Added `children` as an `INSTANCE_SWAP` property with private official-media and Skeleton helpers.
- Kept `fit` out of the variant axis because the official API has a meaningful omitted state. Added a four-way visual guide for omitted, cover, contain, and center instead of inventing a Figma-only value.
- Restored the missing `shape` row in the official props table.
- Replaced vector placeholders in all five official examples with the official Astryx images.
- Restored exact template container dimensions: 300x300 circle/square, 600px-wide gallery, and 600x337.5 widescreen/Skeleton.
- Bound the Skeleton and documentation surfaces to existing Astryx Figma variables where applicable.

## Verification

- Component property definitions: `ratio`, `shape`, and `children` instance swap.
- Six variants have correct dimensions and clipping behavior.
- Official docs, components, and examples frames have no child overflow.
- Broken instances on the AspectRatio page: 0.
- Final screenshot QA passed after correcting inherited fixed-height auto-layout settings.
