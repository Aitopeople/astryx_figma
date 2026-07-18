# CLAUDE.md

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

- Read `checkpoint.md` first when resuming work; it is the current-state handoff, not a historical audit.
- Read only the routing section at the top of `advise.md`, then load the focused protocol files routed for the current task. Do not load the full historical reference on every run.
- Put dated evidence and long audits in `logs/`, then link them from `checkpoint.md`.
- Keep mutable inventory counts and active risks in `checkpoint.md` instead of duplicating them here.

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

- Read `checkpoint.md`, the `advise.md` routing section, and the routed focused protocols before modifying the mirror.
- Derive assets and dimensions from current CLI templates/docs MCP, not from existing Figma placeholders or memory.
- Treat generic mountains, rings, “IMG” labels, gradients, and gray boxes as provisional unless the official source contains them.
- Use Figma `upload_assets` for raster files. Never use `figma.createImage()` or `figma.createImageAsync()` inside `use_figma`.
- Keep intrinsic asset dimensions separate from rendered container dimensions; preserve the official fit, crop, clipping, shape, radius, and scrim.
- Expose only semantically valid controls: finite official unions may be variants; ReactNode/media/content slots may be `INSTANCE_SWAP`; callbacks stay runtime documentation.
- Do not invent `none` or `unset` for an optional omitted prop. Demonstrate omission separately unless `false` is an official value.
- A private `__` helper is permitted only as an unpublished implementation detail for an official slot, never as a new Astryx component.
- Bind tokenable design values to Astryx variables. Fixed media dimensions and explicit source-defined rgba/gradients are permitted only as traceable official-source exceptions.
- Disable inherited auto-layout before assigning explicit child coordinates; otherwise Figma may silently move overlay content outside clipped bounds.
- Prefer in-place component rebuilding to preserve instance links.
- After every write, perform a separate read and screenshot QA. Confirm image fill/scale mode, property wiring, dimensions, child coordinates, clipping/overflow, zero active placeholders, and zero broken instances.
- Follow `automation/protocols/component-production.md` and, for media work, `automation/protocols/visual-assets.md`. Consult the historical `advise.md` asset section only for an unresolved edge case.

## Approved-plan automation

- Use `automation/prompts/coordinator.md` for automated library runs and persist every phase under `automation/runs/<run-id>/`.
- Do not write to Figma until `validate-approval.mjs` confirms the exact plan hash, before-state hash, version, operation scope, and expiry.
- Execute only approved operation IDs. Any discovered additional work starts a new diff/plan/approval cycle.
- Keep Figma reader, editor, and verifier roles separate using the prompt contracts in `automation/prompts/`.
- Reuse exact-version official/asset caches. Default to target+dependency scoped snapshots merged with the latest verified baseline; use full-library reads only for the triggers in `automation/config/library.yaml`.
- Run capability preflight, semantic verification, staged screenshot/hash reuse, and efficiency measurement for every applicable automated operation.
- Verification failure cannot advance the baseline or generated status. Figma library publishing remains manual.
