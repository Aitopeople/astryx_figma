# Unofficial Card Compositions (2026-07-16)

## Scope

User-approved Figma-only components composed from official Astryx Card examples. These are intentionally separated from `OFFICIAL_COMPONENTS` and are not claimed as public React exports.

## Created

- Documentation frame: `UNOFFICIAL_COMPONENTS / Card Compositions` (`959:2`) on the Card page, below the official examples.
- `UNOFFICIAL / Card Composition / Product Action` (`960:4`), based on `ClickableCardWithNestedButton`.
  - Editable properties: `Title`, `Price`.
  - Reuses official primary/md Button instance for `Add to cart`.
- `UNOFFICIAL / Card Composition / Project Update` (`961:7`), based on `CardWithSimpleContent`.
  - Editable properties: `Title`, `Content`, `Meta`.
- `UNOFFICIAL / Card Composition / Profile Layout` (`963:7`), based on `CardWithInnerLayout`.
  - Editable properties: `Title`, `Content`.
  - Structured as `LayoutHeader`, `LayoutContent`, and `LayoutFooter`.
  - Reuses official ghost/md and primary/md Button instances.

All card shells, text colors, borders, spacing, radii, and divider widths use existing Astryx variables. No new variables or official component mutations were required.

## QA

- Per-component metadata and screenshots checked.
- Full frame screenshot checked at 1100 x 822.
- Fixed Project Update body height after visual QA exposed body/meta overlap.
- All three build slots have `placeholder=false`.
- Card page: 6 instances in the new section, 0 broken/missing-main instances.
- Official sets remain intact: Card `504:62` (12 variants), ClickableCard `504:141` (13), SelectableCard `504:233` (13).
