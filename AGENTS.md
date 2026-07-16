# AGENTS.md

Project-specific guidance for AI coding agents.

<!-- ASTRYX:START -->
Astryx v0.1.6 · 149 components
CLI: run every command as `npx astryx <cmd>` (shown below as `astryx ...`).

SETUP (once, in your app entry e.g. main.tsx) — without these, components render unstyled:
  import "@astryxdesign/core/reset.css";
  import "@astryxdesign/core/astryx.css";

WORKFLOW — discover, don't guess. Before writing UI:
1. `astryx build "<idea>"` — START HERE: returns a kit (closest [page] + [block]s + [component]s). No args = full playbook.
2. `astryx template <name> [--skeleton]` — scaffold the [page]/[block]s it named, or study their layout. Templates are reference code.
3. `astryx component <Name>` — props + examples for every component you use.

RULES:
- No <div> — components do all layout/spacing. Full page → AppShell; sidebar nav → SideNav.
- Frame first: pick the shell (AppShell / Layout+LayoutPanel) and budget regions in px BEFORE writing content (`astryx docs layout`).
- Dense data = rows (Table, List/Item) edge-to-edge — never Card-wrapped list items. Card = dashboard widgets, galleries, settings groups only.
- Status → StatusDot/Token; Badge only for counts and enumerated states, never decoration.
- Custom styling: component props first; else style/className with tokens — var(--color-*|--spacing-*|--radius-*). Do not hardcode tokenable design values. A fixed media/intrinsic dimension or source-defined rgba/gradient is allowed only when the official source requires it and no Astryx token represents it. (No StyleX/Tailwind compiler here — don't use xstyle/utility classes.)
- Tokens for every value (`astryx docs tokens`). Brand/accent via `astryx theme` — never override --color-* in :root.

MORE CLI:
  search "<query>"   find any component / hook / doc / template / block
  component --list   149 components by category
  template --list    page + block recipes
  docs <topic>       color, elevation, icons, illustrations, layout, migration, motion, principles, shape, spacing, styling, theme, tokens, typography
  swizzle <Name>     eject component source for deep customization
  upgrade --apply    run after any @astryxdesign/core bump
<!-- ASTRYX:END -->

## Project Memory

- Read `checkpoint.md` first when resuming work; it is intentionally short.
- Read `advise.md` for the detailed Figma mirror workflow and source rules.
- Put long audits and historical notes in `logs/`, then link them from `checkpoint.md`.
- Keep `checkpoint.md` limited to current status, active risks, immediate next work, and log links.

## Verifying example code (source of truth = CLI, not the website)

The docs site (`astryx.atmeta.com`) is a client-rendered SPA — `WebFetch`/curl return only the app shell, never the rendered Examples code. To confirm what an Examples block actually contains, use the local CLI:

1. `npx astryx component <Name>` — read props + the "Related block templates" list; example names live there (e.g. `NavIconBasic`).
2. `npx astryx template <ExampleName>` — prints the exact example source rendered on the site. This is the definitive copy.
3. `npx astryx search "<Name>"` — when the example name is unknown; lists `[component]`/`[template]` entries with the exact command to run.

Caveat: `template` output starts with a license header (`// Copyright (c) Meta Platforms, Inc. and affiliates.`) that the website's code block omits. Compare only the `import … / JSX` body and ignore that line.

## Figma library best practices (cross-checked against Astryx)

When building or maintaining the Figma side of this design system, follow these Figma guides — but **Astryx docs win on any token, style, variant, or naming conflict**:

- Components, styles & shared libraries — https://www.figma.com/best-practices/components-styles-and-shared-libraries/
- Component management tips — https://help.figma.com/hc/en-us/articles/39747637290263-Components-collection-Tips-for-component-management
- Creating & organizing variants — https://www.figma.com/best-practices/creating-and-organizing-variants/
- Name & organize components — https://help.figma.com/hc/en-us/articles/360038663994-Name-and-organize-components

Non-negotiable cross-checks (Astryx overrides generic Figma advice):

- **Names, variants, and props come from official Astryx docs** (`astryx component <Name> --json`), never invented. Figma's "name by purpose / align with code" resolves to: use the exact Astryx component name and its real props — never a made-up `blue-large-button`, and never a Figma-only property that has no Astryx prop behind it.
- **Figma styles/variables bind to Astryx token names AND values** (`astryx docs tokens`): `var(--color-*)`, `var(--spacing-*)`, `var(--radius-*)`, shadow, typography. Do not hardcode a value that has an Astryx token. Official fixed media dimensions and source-defined rgba/gradient scrims are traceable exceptions when no token represents them. Never redefine `--color-*` — brand/accent comes only from `astryx theme`.
- **Follow the mirror's existing Figma taxonomy** in `advise.md` (`OFFICIAL_DOCS_SYNC /`, `OFFICIAL_EXAMPLES /`, `EXAMPLE / <Comp> — <Variant>` frames), not generic slash-naming, wherever the two differ. The "Do not invent" Golden Rule outranks any Figma convenience convention.

Full mapping (each Figma tip reconciled against an Astryx rule): see `advise.md` → "Figma Library Best Practices (Cross-Checked With Astryx)".

## Figma MCP asset and component rules

- Resolve the exact source first: `npx astryx component <Name> --json`, `search`, then `template <ExampleName> --json`. Existing Figma art is never proof of the official asset.
- Generic mountains, rings, “IMG” labels, gradients, and gray rectangles are placeholders unless the official source renders them.
- Raster images must be added with Figma `upload_assets`; do not call `figma.createImage()` or `createImageAsync()` in `use_figma`.
- Record both intrinsic image dimensions and rendered Figma/container dimensions. Do not confuse or normalize them.
- Variant axes must map to finite official prop values. For an optional prop with a meaningful omitted state, do not invent `none`/`unset`; document the omitted behavior instead.
- Use `INSTANCE_SWAP` for official `children`, `content`, `media`, icon, or status slots when a component can represent the slot. Runtime callbacks remain documentation, not visual variants.
- Private `__` helpers are allowed only as unpublished Figma mechanics for an official slot. They must not appear as Astryx API or official components.
- Bind tokenable colors/spacing/radius/type/elevation to Astryx variables. Exact source media sizes and source-defined rgba/gradient scrims are allowed exceptions when no token represents them.
- For explicit media/scrim coordinates, set `layoutMode = 'NONE'` before setting child positions. Reapply AUTO sizing to wrappers after children are appended.
- Preserve existing component IDs where practical, then verify image fills, properties, bounds, clipping, overflow, active placeholders, and broken instances in a separate read.
- Screenshot every changed asset-bearing component and containing official frame. A metadata-only check cannot verify crop, z-order, or visibility.
- Detailed procedure: `advise.md` → “Figma MCP Asset Production Protocol”.

## Approved-plan automation

- For automated library work, follow `automation/prompts/coordinator.md` and the immutable artifacts under `automation/runs/<run-id>/`.
- Figma writes require a valid `approval.json` bound to the exact `planHash`, `figmaBeforeHash`, Astryx version, approved operation IDs, and expiry.
- The editor may execute only operations returned by `validate-approval.mjs`; newly discovered work requires a new diff, plan, and approval.
- Use `automation/prompts/figma-reader.md`, `figma-editor.md`, and `verifier.md` as role contracts. Writing and verification must remain separate.
- Failed verification never updates the verified baseline. Team-library publishing is always manual.
