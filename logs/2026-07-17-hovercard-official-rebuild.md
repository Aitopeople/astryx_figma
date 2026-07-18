# HoverCard Official Rebuild

Date: 2026-07-17  
Astryx source: `@astryxdesign/core@0.1.6`  
Figma page: `HoverCard` (`90:20`)  
Approved run: `automation/runs/2026-07-17-hovercard-official-rebuild-open-states/`

## Result

- Rebuilt the existing `HoverCard` component set (`1112:174`) in place as the official 12-value `placement × alignment` matrix.
- Replaced legacy `top | right | bottom | left` values with `above | below | start | end`; the default is `above / center`, closed.
- Added official `children` and `content` instance-swap slots plus Boolean Figma controls for `isDefaultOpen` and the resolved hover indication.
- Bound every card to `color/background/surface`, `spacing/3`, `radius/container`, and `Shadow/Med`; removed the invented border.
- Replaced the Ada Lovelace preview with the official playground content and explicit closed/open demonstrations.
- Rebuilt Definition, Link Preview, and Profile Preview with the exact official trigger/card content and static open interaction states so the revealed card design is inspectable.
- Reused the existing ghost Button, 48px Avatar, link icon, and calendar icon assets instead of redrawing them.
- Synchronized all 11 prop rows, the exact usage/import text, and all seven official best-practice rows.

## Verification

- Independent readback: 12 variants, 2 valid preview instances, 3 visible official open cards, 11 prop rows, 7 best-practice rows.
- Integrity: 0 broken instances, 0 active placeholders, 0 legacy HoverCard example strings.
- Visual proofs: `screenshots/official-docs.png`, `screenshots/usage-best-practices.png`, `screenshots/component-preview.png`, and `screenshots/examples-preview.png` in the approved run.
- `verify-run.mjs` result: `VERIFIED`.

## Publishing note

Figma does not expose `hiddenFromPublishing` for local components through this API. `__HoverCardTriggerSlot` and `__HoverCardContentSlot` are therefore contained in the hidden `__PRIVATE / HoverCard Slots` frame, use private names/descriptions, and must remain excluded during the manual team-library publish step.
