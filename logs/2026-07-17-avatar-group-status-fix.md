# Avatar and AvatarGroup asset repair

Date: 2026-07-17
Baseline: Astryx v0.1.6
Figma file: `astryx_design_system` (`4YmLJEV002eWzvKLVQru5f`)

## Issue

- Avatar variants clipped the optional status instance because the variant root was also the circular clipping container.
- AvatarGroup overflow frames used a fixed 16px width at every size, producing a narrow pill and clipped label, most visibly at `large`.

## Source cross-check

- `Avatar.tsx` uses an unclipped relative wrapper with a clipped circular content child and an absolutely positioned status sibling.
- Status placement uses `(1 - 1 / sqrt(2)) / 2` as the circle-edge offset ratio plus a 50% dot translation.
- `AvatarGroupOverflow.tsx` resolves to the group avatar size and uses a `0.35` font-size ratio.

## Figma changes

- Preserved the existing `Avatar` component-set ID `19:57` and all 15 variant IDs.
- Added one clipped `content` frame inside each Avatar variant; the variant root is now unclipped and retains the `status` sibling.
- Preserved `Initials`, `Show Status`, and `Status` component-property definitions and their child references.
- Repositioned all status instances using the official circle-edge formula.
- Resized the five AvatarGroup overflow frames to `20`, `24`, `36`, `48`, and `128` square pixels.
- Updated overflow label font sizes to the official `0.35` ratio and restored content-hugging text bounds.
- Rebuilt the AvatarGroup preview assets as source-matched photo facepiles: each item now uses an outer `size + 4px` surface ring around the named-size Avatar or overflow circle.
- Switched all 15 nested group Avatar instances from initials to photo variants and applied the first three official example image fills in the same order across all sizes.
- Re-laid out the five component variants with 32px between variants and resized the component set/documentation row to 1040px so variant previews do not overlap each other.

## Verification

- 15/15 Avatar variants have exactly `content` and `status` at the root.
- Photo fills remain `IMAGE` fills inside the new clipped content frames.
- Status swap/visibility references remain connected to `Status#19:32` and `Show Status#19:16`.
- Status position deltas from the official formula are below `0.000004px`.
- AvatarGroup overflow dimensions match the corresponding Avatar size for all five variants.
- All 20 AvatarGroup ring wrappers use `color/background/surface` and `radius/full` variable bindings; inner Avatar/overflow sizes remain `20`, `24`, `36`, `48`, and `128` pixels.
- All 15 photo overrides match the image hashes used by the official `1217:55` example, and every nested Avatar resolves to the corresponding `Type=photo` main component.
- Adjacent AvatarGroup variants have a verified 32px gap; the component set is 1040×132px and does not clip.
- Visual screenshots passed for the official component section, `Avatar — Status Dot`, and the AvatarGroup component set.
- Broken instances on the Avatar page: `0`.

## Publishing follow-up

The published library still exposes stale AvatarStatusDot entries. Remove stale published entries during the next manual team-library republish as already noted in the release risk list.
## 2026-07-18 AvatarGroup docs/API sync and recovery

- Added exact official AvatarGroup Usage description, import, and four Best practices while preserving the existing Avatar guidance.
- Set the AvatarGroup default variant to official `small` and replaced the unofficial `+4` component previews with the official three-photo `+8` composition.
- A private `children` INSTANCE_SWAP helper was tested and rejected: Figma synchronized its `small` default across every parent size variant. The failed recovery write was atomic and recorded in the failed automation runs.
- Final approved recovery removed the incompatible property/helper and restored direct size-specific ring geometry from the preserved helper variants. The official `children` ReactNode prop remains in docs, and the 15 nested Avatar instances are exposed directly as the faithful Figma editing mechanism.
- Final geometry: tiny 81x24 / -5, xsmall 94x28 / -6, small 133x40 / -9, medium 172x52 / -12, large 432x132 / -32. Default remains `small`; all previews show `+8`.
- Independent readback and screenshots verified the component frame, exact Usage docs, and unchanged official `5 photos +3` / `3 photos +8` example with 0 broken instances, 0 placeholders, and 0 top-level overlaps.
- Verified run: `automation/runs/2026-07-18-avatar-group-direct-geometry-rollback/`.
