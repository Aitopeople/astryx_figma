# Material Icons Local Asset Conversion

Date: 2026-07-16

## Scope

- Figma file: `astryx_design_system` (`4YmLJEV002eWzvKLVQru5f`)
- Page: `Icons (Material Design Icons)` (`539:29`)
- Source: user-provided Material Design Icons, intentionally outside the official Astryx API inventory

## Change

- Converted all 2,122 remote component instances into self-contained local Figma components.
- Preserved every icon's original 24x24 bounds, vector geometry, grid position, and category frame.
- Named assets `MATERIAL_ICONS / <Category> / <icon_name>` across 18 categories.
- Bound every vector fill to the existing `color/icon/primary` variable (`VariableID:7:23`).
- Added component descriptions, Google Icons documentation links, deterministic `dsb` keys, and `astryx` origin metadata with `official=false`.
- Left the 18 category title text nodes unchanged.

## Verification

- Local icon components: 2,122
- Remaining instances on the page: 0
- Unique component names: 2,122; duplicates: 0
- Components not sized 24x24: 0
- Vectors: 2,122
- Vectors bound to `color/icon/primary`: 2,122
- Unbound solid paints: 0
- Mixed-fill vectors remaining: 0
- Missing origin or `dsb` metadata: 0
- Full-page screenshot confirmed all 18 grids render without missing or displaced icons.

## Publishing note

Library publishing remains manual. Treat this collection as optional third-party icon support and do not include it in official Astryx component parity totals.
