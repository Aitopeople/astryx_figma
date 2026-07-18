# Astryx 0.1.6 Legacy Asset Cleanup

Run: `automation/runs/2026-07-16-v016-legacy-asset-cleanup/`

## Outcome

- Added 13 missing visual assets: Center, Grid, GridSpan, HStack, VStack, StackItem, Section, FieldLabel, FieldStatus, FormLayout, InputGroup, InputGroupText, and Spinner.
- Rebuilt or upgraded 30 static/legacy assets so official visual props, content slots, and documented anatomy can be represented in Figma.
- Preserved existing component IDs wherever an official asset already existed; newly added assets used approved high-risk operations.
- Spinner follows the installed `@astryxdesign/core@0.1.6` implementation, including `xl`. Its page explicitly notes that the 0.1.6 CLI docs omit `xl`.
- Behavior-only React props such as callbacks, refs, DOM attributes, timers, and event semantics remain documented instead of becoming inert Figma controls.

## Verification

- 183 logical assets, all names unique.
- 43 targeted assets and 335 target variants.
- 1,203 instances, 0 broken.
- 0 missing targets and 0 duplicate logical names.
- 0 top-level layout overlaps and 0 `OFFICIAL_COMPONENTS` overflow failures on modified pages.
- Representative screenshot readbacks passed for Layout, Field, Spinner, Code, Navigation, and Table.

`SideNavCollapseButton` intentionally has no Figma component property: its `label` is accessibility-only and its visual icon is context-driven in code. Creating an inert property would misrepresent the runtime component.
