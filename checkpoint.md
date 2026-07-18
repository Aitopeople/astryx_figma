# Astryx Figma Mirror Checkpoint

Last updated: 2026-07-18

Read the routing section at the top of `advise.md`, then only the relevant focused protocols before changing Figma. Detailed history belongs in `logs/`.

## Current Status

<!-- AUTOMATION:STATUS:START -->
- Figma file: `astryx_design_system` (`4YmLJEV002eWzvKLVQru5f`)
- Verified baseline: Astryx `v0.1.6`
- Installed exactly: `@astryxdesign/core@0.1.6`, `@astryxdesign/cli@0.1.6`
- Official inventory: 149 components, 43 page templates, 584 block templates
- Figma templates: 43/43 exact slugs; missing 0, extra 0, duplicates 0
- Figma integrity: 81 pages, 2,885 components (763 Astryx mirror + 2,122 user-provided Material icons), 91 component sets, 0 broken instances
- Foundations: 134 variables, 0 missing WEB syntax, 14 text styles, 8 effect styles
<!-- AUTOMATION:STATUS:END -->
- 0.1.4–0.1.6 public API additions and version/source notes are synchronized.
- New 0.1.6 templates `table`, `incident-console`, and `messaging-shell` are editable 1440x1024 frames and passed screenshot/containment checks.
- `AspectRatio` official components now mirror `ratio × shape`, expose a `children` instance-swap slot, document all four `fit` behaviors, and use the official example image assets and source dimensions.
- Asset-focused audit improved Avatar, Thumbnail, Lightbox, Overlay, and MediaTheme from synthetic placeholders to official media-backed, prop-aware component representations.
- `Icons (Material Design Icons)` now contains 2,122 unique local 24x24 components under `MATERIAL_ICONS / <Category> / <icon_name>`; all source instances were detached, all vector geometry was preserved, and every icon color is bound to `color/icon/primary`.
- Agent automation control plane is implemented under `automation/`: versioned schemas, official/Figma snapshots, semantic diff, deterministic plans, hash-bound approval, constrained MCP role contracts, independent verification, generated status blocks, tests, and read-only CI.
- Automation efficiency/semantic v2 is implemented: exact-version official and SHA-256 asset caches, small run references, scoped baseline+Merkle snapshots, compact MCP mutation results, complete-variant/property/example semantic contracts, Figma capability preflight, staged screenshot/hash-reuse planning, efficiency budgets, and explicit publish/consumer-smoke lifecycle states. The suite now has 19 passing tests; legacy snapshots remain readable but touched pages must be recollected with reader-v2 evidence before a semantic operation can verify.
- The first hash-approved full quality run is `VERIFIED`: EmptyState, NavIcon, Link, Blockquote, and Carousel now use source-backed geometry, props, token bindings, and saved visual readbacks (`automation/runs/2026-07-16-full-quality-audit/`).
- The hash-approved 0.1.6 legacy cleanup is `VERIFIED`: 13 missing assets were added, 30 static assets were upgraded, 43 target assets now provide 335 source-backed variants, and the final readback found 0 duplicate names, 0 broken instances, and 0 modified-page layout failures.
- Spinner now follows the installed 0.1.6 canvas implementation (`sm | md | lg | xl`): 135° rounded active arc, 100% Figma Arc ratio, full token-bound track, and 30% onMedia/inherit track opacity. The compact Sizes preview and all 8 nodes across the On Media, Sizes, and With Label official examples use the corrected Spinner construction; the page also discloses that current CLI docs omit `xl`.
- Library-wide icon cleanup replaced all Unicode/emoji control glyphs with token-bound Material instances, and 14 oversized documentation matrices now show only 1–3 representative examples while preserving every source variant.
- MultiSelector now mirrors the installed 0.1.6 implementation: closed by default, actual `isDefaultOpen`, count/labels/badges displays, seven official Column Visibility options, search/select-all/indeterminate/scroll behavior, status icons, and Spinner-backed loading.
- TreeList now mirrors the installed 0.1.6 density, recursive rows, official examples, semantic chevrons, slots, badges, and selected state; expanded/collapsed glyphs and all branch lines share the official visible centerline at x=20 and passed five screenshot checks.
- Lightbox Video now mirrors the official closed initial state with a centered token-bound `Play video` button; the invented dark open-lightbox mock and fake controls were removed and the approved run passed independent visual verification.
- HoverCard now mirrors the official 12 placement/alignment variants, closed default, instance-swap slots, token-bound card surface, exact docs/guidance, and official Definition, Link Preview, and Profile Preview content; all three revealed cards are documented as static open interaction previews and the approved run is `VERIFIED`.
- Avatar now uses the official unclipped wrapper + clipped circular content structure, so its instance-swap status slot remains visible at the circle edge; AvatarGroup uses official photo-backed `size + 4px` surface rings, size-aware overflow, and non-overlapping 32px variant spacing across all five named sizes, with 0 broken instances after structural and screenshot verification.
- AvatarGroup now defaults to official `small`, uses official `+8` photo-backed previews at all five sizes, preserves the official `5 photos +3` / `3 photos +8` example, and includes exact Usage/import/four Best practices. Because Figma synchronizes one exposed INSTANCE_SWAP default across the whole variant set, the ReactNode `children` prop remains documented while the 15 nested Avatar instances are exposed directly; size-specific direct ring geometry passed independent structural and screenshot verification.
- Selector now matches the official 0.1.6 Usage description and all 11 Best practices exactly; its full `htmlName` documentation is restored, and `hasClear=false` correctly hides the clear icon across `sm | md | lg` through the existing BOOLEAN property while preserving component ID `501:60`. Its validation example now uses official 300px medium controls, colored status icons, and correctly layered full-width FieldStatus surfaces. MultiSelector's corrected official panel is synchronized across all 54 public variants (`3 sizes × 3 trigger displays × 6 states`), with source-sized checkboxes/rows, the 260px search input, reserved scrollbar gutter, both scroll arrows, and `isDefaultOpen`-driven panel/open-chevron visibility. The component-set ID/key and public properties are preserved; the set is still unpublished and requires manual team-library republishing for downstream refresh.

## Active Risks and Intentional Exceptions

- Figma library publishing remains manual; downstream consumers do not receive this sync until the team library is republished.
- Remove stale published entries during republish, including old AvatarStatusDot and duplicate Calendar entries documented in the release notes.
- `CircularProgress` is a legacy docs-only reference and is absent from the 0.1.6 CLI registry; do not publish it as official.
- Inter / Roboto Mono are intentional Figma substitutions for the official system-ui / monospace stacks.
- AlertDialog Delete hero promotion and the unofficial Card composition section are user-approved exceptions.
- The Material icon page is a user-approved third-party support library, not part of the official Astryx component inventory; do not rename it into `OFFICIAL_*` taxonomy or use it for Astryx parity counts.
- Do not normalize official example preview widths mechanically; 640/680/720/1040 widths can be source-driven.
- `SideNavCollapseButton` intentionally has no inert Figma property: its label is accessibility-only and its icon is driven by SideNav context.

## Immediate Next Work

1. User manually republishes the team Figma library with the `[BREAKING]` notes from `📋 Release Notes`.
2. After republish, verify downstream library search no longer exposes stale entries and includes the new/updated assets.
3. On the next package bump, use the automation coordinator to rerun the package/CLI/docs-MCP diff before writing to Figma.

## Detailed Logs

- Automation efficiency and semantic verification v2: `logs/2026-07-18-automation-efficiency-semantic-v2.md`
- TreeList official rebuild and centerline verification: `logs/2026-07-16-treelist-official-rebuild.md`
- Lightbox Video official default-state rebuild: `logs/2026-07-17-lightbox-video-official-default-state.md`
- HoverCard official component and open-card example rebuild: `logs/2026-07-17-hovercard-official-rebuild.md`
- Avatar status clipping and AvatarGroup overflow repair: `logs/2026-07-17-avatar-group-status-fix.md`
- Selector official validation and repair: `logs/2026-07-18-selector-official-validation.md`
- Full 81-page quality audit: `logs/2026-07-16-full-quality-audit.md`
- 0.1.6 legacy asset cleanup: `logs/2026-07-16-v016-legacy-asset-cleanup.md`
- 0.1.6 package + Figma sync: `logs/2026-07-16-v0.1.6-package-figma-sync.md`
- AspectRatio official component rebuild: `logs/2026-07-16-aspectratio-component-rebuild.md`
- Official asset page improvements: `logs/2026-07-16-official-asset-page-improvements.md`
- Agent automation control plane: `logs/2026-07-16-agent-automation-control-plane.md`
- Material icon asset conversion: `logs/2026-07-16-material-icons-local-assets.md`
- Unofficial Card compositions: `logs/2026-07-16-unofficial-card-compositions.md`
- Improvement backlog execution: `logs/2026-07-14-improvement-benchmark.md`
- Components/styles/library audit: `logs/2026-07-14-components-styles-library-audit.md`
- Visual verification history: `logs/2026-07-07-round4-visual-verification.md`
- Archived full audit: `logs/2026-07-06-full-audit-checkpoint.md`
