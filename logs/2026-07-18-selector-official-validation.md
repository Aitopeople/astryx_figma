# Selector Official Validation and Repair

Date: 2026-07-18  
Astryx baseline: `@astryxdesign/core@0.1.6`, CLI `0.1.6`  
Figma file: `astryx_design_system` (`4YmLJEV002eWzvKLVQru5f`)  
Page: `Selector` (`90:41`)

## Official sources checked

- `npx astryx build "Selector component official mirror validation"`
- `npx astryx component Selector --json`
- `npx astryx component Selector`
- `npx astryx search "Selector"`
- `npx astryx template SelectorShowcase --json`
- `npx astryx template SelectorClearable --json`
- `npx astryx template SelectorWithSections --json`
- `npx astryx template SelectorWithStatus --json`
- `npx astryx component MultiSelector`
- `npx astryx search "MultiSelector"`
- `npx astryx template MultiSelectorShowcase --json`
- `npx astryx template MultiSelectorSearchableMultiSelector`
- `npx astryx template MultiSelectorColumnVisibilitySelector --json`
- Installed `node_modules/@astryxdesign/core/dist/Selector/Selector.js`
- Installed `node_modules/@astryxdesign/core/dist/FieldStatus/FieldStatus.js`
- Installed `node_modules/@astryxdesign/core/dist/MultiSelector/MultiSelector.js`

## Differences found and repaired

- Added the missing official Usage description above the import example.
- Replaced the shortened Best practices copy with all 11 official CLI entries in official order: 5 Do and 6 Don't rows.
- Added the three missing rows for InputGroup usage, navigation misuse, and disabled Tooltip misuse.
- Restored the full official `htmlName` description and resized its prop row to fit.
- Preserved the public Selector component set ID `501:60` and its existing `sm | md | lg` size variants.
- Connected each size variant's clear icon visibility to `hasClear#501:16`; the official default `false` now hides the clear icon.
- Kept status and disabled as documented/example states rather than inventing an omitted-status Figma variant value.
- Rebuilt `SelectorWithStatus` to match the official rendered states: 300px medium controls, status glyphs in place of chevrons, token-bound error/warning/success colors, full-width attached error and warning message surfaces, and official 24px group spacing.
- Restored the representative open MultiSelector asset to the official `MultiSelectorColumnVisibilitySelector` source: hidden `Columns` label, `4 selected`, Name/Email/Role/Status selected, Created/Updated/Actions unselected, search, and indeterminate Select all.
- Bound the popover to the existing `Shadow/Med` style, preserved the official 300px clipped scroll viewport, and added the visible scrollbar affordances without exposing private mechanics as Astryx API.
- Replaced mixed 20/24px Material checkbox instances with source-derived CheckboxInput geometry: 24px wrapper, 22px box, 14px checkmark, and a 12x2 indeterminate mark. Selected controls use the existing black `color/icon/primary` token to match the official rendered example; unchecked controls retain token-bound surface and emphasized border.
- Rebuilt the search layout as the official padded wrapper plus 260x32 input, reserved a 16px native-scrollbar gutter, normalized option rows to 276x36, and reset the fixed 300px viewport after removing one stale scrollbar-arrow instance.

## Verification

- Separate structural readback confirmed the exact official Usage description and all 11 exact Best practice messages.
- `hasClear` is linked on all three variants and all three default clear icons are hidden.
- Selector public asset count on the page: 1.
- Broken instances: 0.
- Top-level frame overlaps: 0.
- Visual screenshots passed for `OFFICIAL_COMPONENTS / Selector`, `OFFICIAL_USAGE_BEST_PRACTICES / Selector`, and `OFFICIAL_DOCS_SYNC / Selector`.
- The corrected validation example passed visual readback: both attached status surfaces are 300px wide, status icons use the official cancel/warning/check-circle assets at 16px, and all three controls retain 300x40 medium sizing.
- Follow-up 2x QA caught Figma restoring the swapped warning icon to its 24px source size, which made the warning control appear narrowed and pushed the glyph into its right edge. The glyph was changed to the official outlined `warning_amber` asset and normalized in a separate post-swap step to 16x16 at x=272, preserving a 12px right inset. All three 300px controls, both 300px FieldStatus surfaces, and 0 broken instances passed the final 2x readback.
- A second enlarged review identified muted FieldStatus color bleeding through the bottom 6px of the controls. The official negative spacing was correct; the Figma auto-layout paint order was not. Both attached-status wrappers now use reverse child z-order so the control renders above the overlapping FieldStatus, and all three controls are bound to the opaque `color/background/surface` token. Final 2x readback shows muted color only in the message region, with the official -6px attachment retained and 0 broken instances.
- The corrected Column Visibility MultiSelector passed final 2x visual and structural readback: 7 official rows, 4 black checked boxes, 8 total 22px boxes, 260x32 search input outside the scrollbar gutter, exactly two visible scroll arrows, an 8x232 thumb, a fixed 300px clipped viewport, `Shadow/Med` elevation, and 0 broken instances.
- Connection follow-up found that the corrected open example was a detached FRAME while the public `MultiSelector` set still contained its stale hidden panel. The verified panel was cloned into the existing `size=md, triggerDisplay=count, state=default` component (`1115:500`), preserving component-set ID `1115:1034`, key `19cf66b225eda6f9638ba0e8d272a5e01c141741`, and the `isDefaultOpen` / `hasSearch` / `hasSelectAll` property references. The detached example was replaced by connected instance `1308:2419` with `isDefaultOpen=true`; final readback confirmed the correct main component, 300x344 bounds, 7 rows, 8 boxes, 2 scroll arrows, and 0 broken instances. The set remains `UNPUBLISHED`, so downstream library consumers require a manual republish.
- Library-asset follow-up found the remaining cause of stale inserted assets: only `md/count/default` had received the repaired panel, while the other 53 variants still held the old checkbox/search/scroll construction. The corrected panel was synchronized across all 54 variants while preserving the component-set ID/key and public property definitions. Size-specific geometry is now `sm` 18px boxes / 28px option rows / 24px Select-all, `md` 22px / 36px / 32px, and `lg` 22px / 40px / 32px. All variants use the 276px content lane, 260x32 search input, 8x232 scrollbar thumb, and both 12px scroll arrows. The nine default-state variants also expose an `isDefaultOpen`-linked up-chevron overlay, so opened instances no longer retain the closed chevron.
- Independent full-set readback after that sync reported 54 variants, 54 panels, 378 option rows, 432 checkbox boxes, 9 open-chevron overlays, 0 old Material checkbox instances, 0 broken instances, and 0 geometry/property-reference issues. The component key remains `19cf66b225eda6f9638ba0e8d272a5e01c141741`; all seven public property definitions and their values are unchanged. A fresh screenshot of `OFFICIAL_COMPONENTS / Selector` visually confirmed the official black selected/indeterminate controls, non-overlapping 260px search field, reserved scrollbar gutter, visible top and bottom arrows, and clipped 300px popover. Figma still reports the component set as `UNPUBLISHED`, so the repaired 54-variant set must be manually republished before downstream library instances can refresh.
- No text clipping, row overflow, overlap, or broken icon visibility was observed.
