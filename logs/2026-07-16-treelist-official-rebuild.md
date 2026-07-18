# TreeList Official Rebuild and Alignment

Date: 2026-07-16  
Source: `@astryxdesign/core@0.1.6` and Astryx CLI component/template output  
Figma page: `TreeList` (`90:59`)

## Result

- Rebuilt the existing `TreeList` component set in place and preserved component/variant IDs.
- Mirrored the official `density=compact | balanced | spacious` row padding and the balanced default.
- Removed the invented root surface, forced header property, invented labels, and inter-row density gaps.
- Restored the official showcase tree structure, recursive indent, branch tokens, selected state, and start/end slots.
- Rebuilt the File Tree, Interactive Settings, Mailbox, and Navigation examples from the exact CLI templates.
- Reused official Icon and Badge components for folder/document/settings/trailing-chevron and count slots.

## Chevron and branch corrections

- Replaced rotated `chevronRight` instances used for expanded state with the existing semantic `chevronDown` asset (`893:38`) at rotation `0`.
- Preserved collapsed/trailing `chevronRight` asset `893:46` at rotation `0`.
- The first direct-holder centerline plan was rolled back and marked failed because Figma Auto Layout controls holder `x`.
- The verified Auto Layout-compatible plan represents the source `+4/-4px` chevron margin through the existing non-clipping slot: 14px glyph `x=5`, branch line `x=19.5`. Both visible centers resolve to `x=20`.
- All 18 branch lines retain `color/border-emphasized` (`VariableID:7:36`).

## Verification

- Verified 13 toggle glyphs and 18 branch lines by independent readback.
- Screenshot-checked the official component frame and all four official examples.
- Final integrity: 0 broken instances, 0 active placeholders.
- Verified automation runs:
  - `automation/runs/2026-07-16-treelist-chevron-alignment-fix/`
  - `automation/runs/2026-07-16-treelist-visible-centerline-fix/`
- Team-library publishing remains manual.
