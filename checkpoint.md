# Astryx Figma Mirror Checkpoint

Last updated: 2026-07-16

Read `advise.md` before changing Figma. Detailed history belongs in `logs/`.

## Current Status

<!-- AUTOMATION:STATUS:START -->
- Figma file: `astryx_design_system` (`4YmLJEV002eWzvKLVQru5f`)
- Verified baseline: Astryx `v0.1.6`
- Installed exactly: `@astryxdesign/core@0.1.6`, `@astryxdesign/cli@0.1.6`
- Official inventory: 149 components, 43 page templates, 584 block templates
- Figma templates: 43/43 exact slugs; missing 0, extra 0, duplicates 0
- Figma integrity: 81 pages, 424 components, 60 component sets, 0 broken instances
- Foundations: 134 variables, 0 missing WEB syntax, 14 text styles, 8 effect styles
<!-- AUTOMATION:STATUS:END -->
- 0.1.4–0.1.6 public API additions and version/source notes are synchronized.
- New 0.1.6 templates `table`, `incident-console`, and `messaging-shell` are editable 1440x1024 frames and passed screenshot/containment checks.
- `AspectRatio` official components now mirror `ratio × shape`, expose a `children` instance-swap slot, document all four `fit` behaviors, and use the official example image assets and source dimensions.
- Asset-focused audit improved Avatar, Thumbnail, Lightbox, Overlay, and MediaTheme from synthetic placeholders to official media-backed, prop-aware component representations.
- Agent automation control plane is implemented under `automation/`: versioned schemas, official/Figma snapshots, semantic diff, deterministic plans, hash-bound approval, constrained MCP role contracts, independent verification, generated status blocks, tests, and read-only CI.

## Active Risks and Intentional Exceptions

- Figma library publishing remains manual; downstream consumers do not receive this sync until the team library is republished.
- Remove stale published entries during republish, including old AvatarStatusDot and duplicate Calendar entries documented in the release notes.
- `CircularProgress` is a legacy docs-only reference and is absent from the 0.1.6 CLI registry; do not publish it as official.
- Inter / Roboto Mono are intentional Figma substitutions for the official system-ui / monospace stacks.
- AlertDialog Delete hero promotion and the unofficial Card composition section are user-approved exceptions.
- Do not normalize official example preview widths mechanically; 640/680/720/1040 widths can be source-driven.

## Immediate Next Work

1. User manually republishes the team Figma library with the `[BREAKING]` notes from `📋 Release Notes`.
2. After republish, verify downstream library search no longer exposes stale entries and includes the new/updated assets.
3. For the first automation pilot, collect a complete Figma before-snapshot and approve a small documentation-only plan before enabling asset/property writes.
4. On the next package bump, use the automation coordinator to rerun the package/CLI/docs-MCP diff before writing to Figma.

## Detailed Logs

- 0.1.6 package + Figma sync: `logs/2026-07-16-v0.1.6-package-figma-sync.md`
- AspectRatio official component rebuild: `logs/2026-07-16-aspectratio-component-rebuild.md`
- Official asset page improvements: `logs/2026-07-16-official-asset-page-improvements.md`
- Agent automation control plane: `logs/2026-07-16-agent-automation-control-plane.md`
- Unofficial Card compositions: `logs/2026-07-16-unofficial-card-compositions.md`
- Improvement backlog execution: `logs/2026-07-14-improvement-benchmark.md`
- Components/styles/library audit: `logs/2026-07-14-components-styles-library-audit.md`
- Visual verification history: `logs/2026-07-07-round4-visual-verification.md`
- Archived full audit: `logs/2026-07-06-full-audit-checkpoint.md`
