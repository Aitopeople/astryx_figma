# Astryx Figma Development Advice

This directory is for maintaining the Figma mirror of the official Astryx design system.

The goal is not to create a similar-looking design system. The goal is to keep the Figma file as a 1:1 mirror of the official Astryx docs.

Figma file:

- Name: `astryx_design_system`
- Current verified baseline: Astryx `v0.1.6`
- Current handoff summary: `checkpoint.md`
- Detailed audit history: `logs/`

## Golden Rule

Do not invent.

This applies to:

- page names
- component groupings
- subcomponents
- props
- descriptions
- examples
- no-example notes
- component variants
- public helper components presented as Astryx API

If the official docs do not expose something, do not present it as official in Figma. If the official docs expose something, Figma must include it.

Private implementation helpers are allowed only when Figma needs them to model an official slot or behavior that cannot otherwise be represented. Prefix them with `__`, keep them outside official documentation and publishing surfaces, derive them from official assets/components, and record why they exist. A private helper is a Figma mechanism, never a new Astryx component or prop.

## Required Sources

Use all of these sources together. No single source was complete enough during the previous work.

1. Astryx MCP
   - Use `search` to discover official entries.
   - Use `get` to inspect component docs, props, examples, and related entries.

2. Astryx CLI
   - Run commands through `npx astryx`.
   - Use `npx astryx component <Name> --json` for official prop metadata.
   - Use `npx astryx component --list` and `npx astryx search "<query>"` when the official surface is unclear.

3. Official website
   - Check `https://astryx.atmeta.com/components/<ComponentName>`.
   - The site is a **client-rendered SPA**: `WebFetch`/curl return only the app shell, not the rendered Examples. Render in a real browser (Playwright) OR use the preserved crawl below.
   - Do not rely only on curl/raw HTML.

4. Preserved crawl (version-bound fallback only)
   - A crawl may be used only when its recorded Astryx version matches the currently installed package/site version.
   - `pages/<Comp>.json` → `cards[]`; each card has `title`, `text` (the full rendered text of that card), `afterExamples` (true = an Examples card, false = the hero/props region), and `shot` (PNG path). `shots/<Comp>/<n>_<Title>.png` are the visual captures.
   - The card `text` field is useful for exact rendered captions and visible content, but it never overrides newer CLI templates, current docs MCP data, or the currently rendered site.
   - A crawl from an older baseline is stale evidence. Re-crawl after every upstream version bump before using it for coverage claims.
   - Caveat: scratchpad paths are temporary. If the crawl is gone or its version is unknown, do not cite it as authoritative.

5. Figma MCP
   - Use it to inspect and modify the Figma file.
   - Always verify writes in a separate read call.
   - Use `upload_assets` for raster images. Do not use `figma.createImage()` or `figma.createImageAsync()` inside `use_figma`.

## Known Failure Modes From Previous Work

### 1. Astryx MCP `get` Can Miss Official Examples

`get` is useful, but it did not always expose every example shown on the official site.

Observed examples:

- `Badge` initially missed `Badge — Counts` and `Badge — Status`.
- `TextArea` and `TextInput` also needed official webpage verification.

Required practice:

- Treat MCP `get` as one source, not the final source.
- Compare MCP examples against the rendered official webpage.
- If there is a mismatch, the official webpage wins for visible example coverage.

### 2. Raw HTML Can Under-Report Examples

The official Astryx site can render the real `Examples` section client-side.

The initial HTML/RSC payload may contain only hero showcase metadata, not the full visible examples list.

Required practice:

- Use Playwright or another real browser render to inspect the visible `Examples` section.
- Read every official example card after the `Examples` heading.
- Capture title, description, preview height/size, and visible UI content.
- Do not mark examples as absent from raw HTML alone.

### 3. Hero Showcase Is Not The Same As Full Examples

Some pages expose a hero/showcase item in payload metadata. Earlier work accidentally collapsed full example sets into one showcase card.

Required practice:

- If a page has rendered example cards, implement the rendered example cards.
- Use showcase metadata only when there is no rendered Examples section and the metadata is the only official example signal.

### 4. Figma Broad Writes Can Be Snapshot-Prone

Large multi-page Figma MCP writes previously caused synced sections to disappear.

Required practice:

- Prefer page-scoped writes.
- In every write script, find the target page and call `await figma.setCurrentPageAsync(page)`.
- Mutate only that page.
- Return all mutated and created node IDs.
- Verify in a separate Figma MCP read call.

Avoid broad multi-page rewrites unless the work explicitly requires them and the whole file state is being rebuilt intentionally.

### 5. Arbitrary Grouping Is Not Allowed

Earlier Figma pages used invented group names such as navigation/content/overlay bundles. These were wrong because they did not match the official docs.

Required practice:

- Page names and groupings must follow the official docs navigation.
- If official docs group entries under one page, keep them together.
- If official docs list entries separately, do not merge them into a made-up combined page.

### 6. Static Examples Are Not A Substitute For Official Structure

The current examples are static Figma compositions. That is acceptable for documentation, but the structure still needs to match official examples.

Required practice:

- Use official example titles exactly.
- Use official descriptions exactly.
- Recreate the visible UI content, labels, states, and sizing from the rendered page.
- Keep official example card anatomy consistent:
  - 912px card width
  - official preview area height
  - Description/Code/Open in Playground strip
  - official description text

### 7. Synthetic Media Is Not An Official Asset

Generic mountains, rings, “IMG” labels, gray rectangles, or gradient blocks are construction placeholders unless the official source actually renders them.

Required practice:

- Extract image URLs or inline image data from the exact CLI template used by the official example.
- Download/upload the original asset and record its intrinsic pixel dimensions.
- Separately record the rendered container dimensions from the template. Intrinsic image size and placed Figma size are different facts.
- Use the template's `fit`, crop, shape, radius, scrim, and container size. Do not infer them from an existing Figma placeholder.
- After upload, read back the node and confirm an `IMAGE` fill, expected scale mode, clipping, and dimensions.
- Screenshot every asset-bearing component/page after the upload. A structural read alone cannot catch a wrong crop, z-order, or invisible overlay.

### 8. Props Must Be Modeled By Meaning, Not By Convenience

- Use a variant axis only for a finite official prop union whose values create distinct visual states.
- Use `INSTANCE_SWAP` for official ReactNode/media/content slots when a replaceable Figma component can represent the slot.
- Use TEXT/BOOLEAN properties only when they map to the official value or to the visible presence of an official callback-controlled affordance.
- Do not expose callbacks such as `onOpenChange` or `onIndexChange` as invented visual variants. Document them as runtime behavior.
- If an optional prop has a meaningful omitted state, do not invent `none`, `unset`, or `default`. Show the omitted behavior in a documentation comparison unless the official union explicitly includes `false`.
- Derived fallback output such as photo → fallback image → initials → icon may be demonstrated, but must not be mislabeled as an official React prop.
- When Figma cannot faithfully expose an official prop, keep the prop in the docs table and explain the representation gap in the component description.

### 9. Auto-Layout Can Invalidate Manual Asset Coordinates

When rebuilding a visual component with explicit media/scrim/content coordinates:

- Set the target component or frame to `layoutMode = 'NONE'` before assigning child `x`/`y`.
- For structured rows/columns, use auto-layout and append children before assigning `HUG`/`FILL`.
- After adding children, reapply `primaryAxisSizingMode = 'AUTO'` to documentation wrappers that should grow. Calling `resize()` can leave an inherited fixed-height mode.
- Read back every child position and screenshot the result. Existing auto-layout may silently move newly appended children far outside the clipping bounds.

## Official Page Structure (do not omit sections)

An official component page may render the following sections, in order:

1. **Usage** — a one-line description + a `ts` import code block (e.g. `import {Button} from '@astryxdesign/core/Button'`). Import paths come from `astryx component <Name> --json` → `.data.import` (exceptions exist: Checkbox→`{CheckboxInput}`, Radio→`{RadioList}`, Tabs→`{TabList}`, Toast→`{Toast}`, etc.).
2. **Best practices** — a Guidance/Practices table of Do (green) / Don't (red) rows, only when the current official source provides it.
3. **Examples** — the titled example cards, only when current official examples exist.

The Figma mirror represents available sections as an `OFFICIAL_USAGE_BEST_PRACTICES / <Name>` box plus `EXAMPLE / …` frames. Usage/import is required for public components. Best practices and Examples are conditional: never fabricate an empty section or content that the official source does not provide.

## Verifying Example CODE (CLI Is The Source Of Truth)

To confirm the exact **code** in an official Examples block, do not rely on the website — `astryx.atmeta.com` is a client-rendered SPA, so `WebFetch`/curl return only the app shell, never the rendered example source. Use the local CLI:

1. `npx astryx component <Name>` — read props + the "Related block templates" list. The example names live there (e.g. `NavIconBasic`, `NavIconShowcase`).
2. `npx astryx template <ExampleName>` — prints the exact example source rendered on the site. **This is the definitive copy** to diff against Figma or against user-supplied code.
3. `npx astryx search "<Name>"` — when the example name is unknown; it lists `[component]`/`[template]` entries with the exact command to run.

Caveat: `template` output begins with a license header (`// Copyright (c) Meta Platforms, Inc. and affiliates.`) that the website's code block omits. Compare only the `import … / JSX` body and ignore that first line — otherwise an otherwise-identical example reads as a false mismatch.

## Fast Audit Method: Text / Token Diff (preferred over screenshot-per-frame)

Screenshotting every frame is slow and can miss content drift. Instead:

1. In one read-only `use_figma` call, extract each `EXAMPLE /` frame's preview TEXT (join `findAll(TEXT).characters`) + its caption (the TEXT under the `Description` sub-frame). Batch many pages per call via `page.loadAsync()` (no `setCurrentPageAsync` needed for reads).
2. Diff the token set against the crawl card `text` (strip chrome: `Description`/`Code`/`Open in Playground`, bare day-numbers, aria-labels like `Select row`). Compare captions exactly.
3. Screenshot-verify structural rebuilds and **every image upload, crop/fit change, scrim/overlay change, or component-property visual behavior**. Text-only clean pages do not need a screenshot per frame.

This surfaces text drift quickly, but it is not an asset audit. Run the diff with any available read-only local tool (PowerShell or Node is sufficient); do not make a particular scripting runtime a project requirement, and do not create temporary repo files merely to inspect the result.

## Two Drift Classes To Check

The 2026-07 text audit found drift concentrated in two predictable places. These findings describe text/example drift only; they do not exempt any component from media, property, or layout verification:

1. **Example CONTENT approximated with generic placeholders** — in structural / layout / disclosure / overlay sets whose examples are scaffolding rather than real data. Confirmed cases: AspectRatio, Grid (all 4), MetadataList (all 3), Layout (Dual Panel / Sidebar Nav schematic), Collapsible (all 4), Dialog (4), CommandPalette (4), Kbd (2). Symptoms: wrong item counts, wrong values/labels, invented icons/headings.
2. **Paraphrased example CAPTIONS** — only on the aggregate pages (Chat, Navigation), where captions were shortened/reworded vs official. Fix: overwrite each caption with the exact crawl caption (last paragraph of the card `text`).

Past text/token checks found many content/data components comparatively clean, so they may be lower priority for another **text-only** pass. That is not evidence that their assets or props are correct. Media-bearing components such as Avatar, Thumbnail, Lightbox, Overlay, and MediaTheme always require a separate source, crop/fit, bounds, property, and screenshot audit; matching labels alone cannot prove asset fidelity.

## Font Substitution Rule (conscious deviation — do not "fix")

Official Astryx font tokens are CSS stacks that Figma cannot express:

- `--font-family-body` / `--font-family-heading` = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- `--font-family-code` = `"SF Mono", Monaco, Consolas, monospace`

The Figma mirror substitutes **Inter** (body/heading) and **Roboto Mono** (code) everywhere, including the `font-family/*` Typography variables and all 14 text styles. This is the intended, documented approximation — do not swap fonts to "match" the official stack, and do not flag Inter/Roboto Mono as drift. All other typography attributes (sizes, weights, 4px-grid line heights) must match the official type scale exactly.

## Figma File Naming Conventions

- Per single-component page: `OFFICIAL_DOCS_SYNC / <Name>` (description + `PROP_ROW / <Comp>.<prop>` rows), `OFFICIAL_COMPONENTS / <Name>` (insertable reps), `OFFICIAL_EXAMPLES / <Name>` (holds `EXAMPLE / <Comp> — <Variant>` frames; note some use `Example /`). Plus `OFFICIAL_USAGE_BEST_PRACTICES / <Name>`.
- Aggregate pages (Chat, Navigation, Utilities) split into named "Chunk" frames; each documents several subcomponents (props → per-subcomponent Usage/BP box → next). Utilities uses `SECTION_TITLE /` + `PROP_ROW / <Comp> / <prop>`.
- The hero (crawl card 0, `afterExamples: false`) is **not** an example — it is the page's top showcase. Never promote it to an `EXAMPLE` unless the user explicitly asks.

## Figma Library Best Practices (Cross-Checked With Astryx)

Follow Figma's official guidance for component/style/library health, but this file's **Golden Rule ("Do not invent") and Astryx docs always outrank generic Figma advice.** Figma tells you *how* to keep a library maintainable; Astryx tells you *what the content must be*. When they conflict, Astryx wins.

Source guides:

- Components, styles & shared libraries — https://www.figma.com/best-practices/components-styles-and-shared-libraries/
- Component management tips — https://help.figma.com/hc/en-us/articles/39747637290263-Components-collection-Tips-for-component-management
- Creating & organizing variants — https://www.figma.com/best-practices/creating-and-organizing-variants/
- Name & organize components — https://help.figma.com/hc/en-us/articles/360038663994-Name-and-organize-components

Astryx rules the guidance is cross-checked against (verify live): `npx astryx docs styling`, `npx astryx docs tokens`, `npx astryx docs theme`, `npx astryx component <Name> --json`.

### Naming & organization

- **Figma:** name by purpose not appearance; align design names with code (`Button` ↔ `<Button>`); use slash hierarchies; establish conventions early; name internal layers meaningfully.
- **Astryx cross-check (wins):** component, example, and prop names come **only** from official Astryx docs/CLI/MCP — never invented, never appearance-based. The mirror's established taxonomy (`OFFICIAL_DOCS_SYNC / <Name>`, `OFFICIAL_COMPONENTS / <Name>`, `OFFICIAL_EXAMPLES / <Name>`, `EXAMPLE / <Comp> — <Variant>`, `PROP_ROW / <Comp>.<prop>`, aggregate "Chunk" frames, `SECTION_TITLE /`) is the authoritative naming scheme. Do **not** rename existing frames to a generic `component/state` slash scheme just because Figma suggests it — that would break the mirror and the Golden Rule.
- Net effect: Figma's "align with code" is already satisfied, because the Astryx component name *is* the code name. Use exact official titles/captions (see "Official Example Extraction Checklist").

### Variants & properties

- **Figma:** use variants for distinct states/sizes that map to code props; avoid permutation explosion (nest instances instead); forward-slash layer groups become variant property values; add variant descriptions.
- **Astryx cross-check (wins):** variant axes and property names must correspond to **real Astryx props** from `component <Name> --json` → `.data`. Do not add a public Figma variant/property that has no Astryx meaning, and do not omit an official prop from documentation. Not every React prop can or should become a Figma control: callbacks remain runtime documentation, arbitrary strings/URLs may be represented by source-backed content, and meaningful omitted states must not be replaced with invented values. Prop-table counts are audited (`PROP_ROW` count == CLI prop count).

### Styles, variables & tokens (highest-risk conflict)

- **Figma:** create styles for every system color/text/effect/grid; group with slash prefixes (`Alerts/…`); prefer variables for themeable values.
- **Astryx cross-check (wins):** every Figma color/spacing/radius/shadow/type value must bind to an **Astryx token name and its exact value** from `npx astryx docs tokens` — e.g. `--color-accent` = `#0064E0` (light) / `#2694FE` (dark), `--color-background-surface`, `--spacing-*`, `--radius-*`. Hard rules from `docs styling` → "What NOT to do":
  - **No raw hex/px for tokenable design-system values.** Bind colors, spacing, radius, typography, and elevation to Astryx variables.
  - Source-backed exceptions are allowed when the official template itself uses a fixed media dimension, intrinsic asset size, image crop, or explicit rgba/gradient scrim and no Astryx token represents it. Record the source; do not turn the exception into a new token.
  - **Never redefine `--color-*`.** Brand/accent changes come only from `astryx theme` (theme packages like `@astryxdesign/theme-neutral`), never by overriding a color token in place.
  - Astryx colors use `light-dark()` for automatic mode switching — model light/dark as **token modes/variable collections**, not two unrelated styles, so a single semantic token drives both.
  - Semantic-token intent must be preserved: `--color-text-*`, `--color-icon-*`, `--color-background-*`, `--color-border*`, status (`--color-success/-error/-warning` + `-muted`/`-on-*`). Do not collapse or rename these into ad-hoc palette styles.
- Styling approaches: `xstyle` (StyleX via `stylex.create()`), `className`/`style`, and the Tailwind token bridge are all valid per `docs styling` — `xstyle` is the preferred surface for component-specific overrides. Whichever is used, values must still resolve to Astryx tokens (the binding rules above); `:hover` in xstyle requires the `@media (hover: hover)` guard.

### Components, states & atomic structure

- **Figma:** build atomic/nested components; prefer separate components per state over hidden-layer toggling (better discovery + preserved overrides); rename matching text layers across variants to preserve overrides; add component descriptions and do/don't guidance; embed accessibility (contrast, states, annotations).
- **Astryx cross-check (wins):** the *set* of states/examples/best-practice rows is fixed by official docs (rendered Examples cards + the "Guidance" Do/Don't table + the Usage import line). Follow Figma's structural mechanics freely, but never add or drop a state/example/practice that the official page doesn't have. Descriptions and Do/Don't text must be the **exact official strings**, not paraphrased.

### Shared library, updates & lifecycle

- **Figma:** single vs. split libraries; distinguish breaking vs. non-breaking changes; test instances before publishing; changelog with `[UPDATE]`/`[BREAKING]`/`[DEPRECATED]`; deprecate gracefully; use library analytics.
- **Astryx cross-check (wins):** the library tracks a **verified Astryx baseline** (currently `v0.1.6`) — treat an upstream Astryx version bump as the trigger for a change, and re-run the global audit before claiming sync (see "Current Verified State"). Record breaking/non-breaking notes and deprecations in `checkpoint.md` + `logs/`, following the existing pattern (e.g. the `CircularProgress` docs-only exception is a graceful-deprecation-style note). Do not publish structural rebuilds without the separate verify read (see workflow step 7).

### Quick decision rule

If a Figma best practice would change a **name, prop, variant axis, token value, example count, caption, or grouping**, stop and re-derive it from Astryx (`component --json`, `docs tokens`, rendered Examples / preserved crawl). Apply the Figma practice only to *mechanics* (auto-layout, atomic nesting, override preservation, publishing hygiene, changelog discipline) that leave official content byte-for-byte intact.

## use_figma Gotchas Specific To This File

- Example `Description` sub-frames are FIXED height + `clipsContent` — when replacing a caption with longer official text, set the Description frame `primaryAxisSizingMode='AUTO'` (or captions clip).
- Expandable component instances (Collapsible, etc.) have FIXED height sized to the old content — longer official content overflows onto the next row. Set open instances (and their content TEXT) to `layoutSizingVertical='HUG'`.
- Rows that overflow horizontally (e.g. Kbd combos) need `layoutWrap='WRAP'` + `counterAxisSizingMode='AUTO'` on the row and a hug-height chain up the parents.
- `textAutoResize` enum is `NONE|WIDTH_AND_HEIGHT|HEIGHT|TRUNCATE` — there is **no `WIDTH`**.
- Edit instance content via component properties where they exist (`setProperties({'Title#34:0': …, 'Open': 'true'})`), else via nested text override; multi-char key/badge frames may need hug width to avoid wrapping.
- CLI fetches: do not bulk-fetch all pages at once (73-page fetch timed out at 7 min). Batch ~10–14 per call.
- Image upload: create/select the exact destination node first, call `upload_assets`, POST the original bytes, then read back the fill. Upload URLs are single-use and short-lived.
- Component sets: cloning variants preserves inherited layout settings. Set each rebuilt visual variant's layout mode before positioning children.
- Component properties: save the exact key returned by `addComponentProperty`; wire it immediately through `componentPropertyReferences`.
- Visual QA: use `contentsOnly: true` when isolating an official frame, but re-request once if a screenshot conflicts with structural readback; short-lived renderer artifacts can occur.

## Figma MCP Asset Production Protocol

1. Resolve the exact official example with `npx astryx search`, `component --json`, and `template <Name> --json`.
2. List every referenced raster/SVG, its source URL/data, intrinsic dimensions, alt text, rendered dimensions, fit/crop, shape, radius, and scrim.
3. Inspect the existing Figma component ID, all dependent instances, current component properties, and parent auto-layout before writing.
4. Prefer in-place rebuilding to preserve component IDs and downstream instances.
5. Reuse existing Astryx variables and published/local components. Create a private `__` helper only for an official slot that cannot otherwise be modeled.
6. Upload raster assets only through `upload_assets`. Keep original bytes unchanged unless the official source itself transforms them.
7. Model props according to the semantic rules above; keep runtime-only props in documentation.
8. Read back property definitions, image fills, child coordinates, dimensions, clipping, overflow, and broken-instance count.
9. Screenshot the component set and its containing `OFFICIAL_COMPONENTS` frame. For examples, also screenshot the affected `OFFICIAL_EXAMPLES` frame.
10. Record intrinsic and placed dimensions plus intentional representation gaps in a dated log.

## Approved-Plan Automation Gate

Automated Figma edits use the contracts in `automation/`:

1. Collect immutable `official.json` and complete `figma-before.json` snapshots.
2. Generate `diff.json` and a canonical, hashed `plan.json`.
3. Present the exact hash, operations, evidence, risk, and verification requirements for human approval.
4. Persist approval as `approval.json`; conversational context alone is not execution authority.
5. Immediately before the first write, validate the plan hash, before-state hash, source version, operation scope, high-risk acknowledgements, and expiry.
6. Execute only approved operation IDs using `automation/prompts/figma-editor.md`.
7. Verify in a separate read using `automation/prompts/verifier.md`.

If the source, plan, target precondition, or Figma state changes after approval, stop and generate a new plan. Do not amend a plan in place, reuse an old approval, improvise extra cleanup, or assume structural rollback. Library publishing remains manual.

## Recommended Workflow For Each Component Page

1. Confirm the current Astryx version.

   ```powershell
   npm view @astryxdesign/core version
   npm view @astryxdesign/cli version
   npm install
   npx astryx upgrade --apply
   ```

2. Discover the official component/group.

   ```powershell
   npx astryx search "<ComponentName>"
   npx astryx component <ComponentName> --json
   ```

3. Query Astryx MCP.

   Use MCP `search` and `get` for:

   - component description
   - props
   - related components
   - hooks
   - examples returned by MCP

4. Render the official webpage.

   Open:

   ```text
   https://astryx.atmeta.com/components/<ComponentName>
   ```

   Extract:

   - Overview text
   - Props table
   - every rendered `Examples` card
   - example title
   - example description
   - preview content
   - preview/card dimensions
   - no-example status if no examples exist

5. Compare sources.

   Required comparison:

   - CLI prop count vs Figma `PROP_ROW` count
   - MCP examples vs rendered webpage examples
   - rendered webpage examples vs Figma `EXAMPLE` cards
   - official group members vs Figma page sections

6. Write to Figma page-scope only.

   Figma MCP script requirements:

   - load `figma-use` guidance before using `use_figma`
   - find the exact target page
   - `await figma.setCurrentPageAsync(page)`
   - do not loop through pages and mutate many pages in one script
   - load fonts before changing text
   - use auto-layout for structured content
   - return created/mutated node IDs

7. Verify after writing.

   In a separate Figma MCP read:

   - count `PROP_ROW` frames
   - count `EXAMPLE` frames
   - list example titles
   - confirm no invented examples
   - confirm no missing official examples
   - inspect screenshot for clipped text or overlap
   - for assets: confirm image hash/fill, crop/fit, z-order, original vs placed dimensions, and that no synthetic placeholder remains
   - confirm zero broken instances and zero active Figma `placeholder` shimmers

8. Update the handoff records.

   In `checkpoint.md`, record only:

   - current status
   - immediate next action
   - current risks or exceptions
   - links to any detailed log files

   If the update needs long notes, component-by-component findings, source dumps, or historical detail, create a dated file under `logs/` and link it from `checkpoint.md`.

## Figma MCP Guidelines

Use small, deterministic scripts.

Good pattern:

```js
const page = figma.root.children.find(p => p.name === "Badge");
if (!page) throw new Error("Badge page not found");
await figma.setCurrentPageAsync(page);

// mutate only this page

return {
  mutatedNodeIds,
  createdNodeIds,
  propRowCount,
  exampleTitles
};
```

Avoid:

- mutating many pages in one script
- relying on `figma.currentPage = page`
- editing text without loading fonts
- using `console.log` as output
- creating broad archive pages
- keeping old arbitrary taxonomy pages
- drawing generic media placeholders when an official asset is available
- adding `none`/`unset` variants for optional props that officially use omission
- positioning children before disabling inherited auto-layout

## Astryx MCP Guidelines

Use Astryx MCP for official discovery, but do not stop there.

Recommended usage:

- `search("<name>")` before assuming a component exists or does not exist.
- `get("<name>")` for metadata and props.
- If `get` suggests related entries, inspect the parent and siblings.
- For grouped docs, check every member page separately.

Important:

- React props/properties in Figma must come from official Astryx docs/CLI/MCP.
- Figma component properties are not official React props.
- Existing Figma prose is not authoritative.

## Official Example Extraction Checklist

Before writing or changing any example section, confirm all of this:

- MCP `get(<ComponentName>).moreExamples`
- rendered official webpage `Examples` section (or the preserved crawl `afterExamples: true` cards)
- raw payload/showcase metadata if visible examples are absent
- official sidebar/group membership
- whether the entry is a component, subcomponent, hook, or non-public implementation detail
- the **Usage** import line (`.data.import`) and **Best practices** table (crawl "Guidance" card) — these are official page sections, not optional
- for each example: exact title, exact caption (last paragraph of the crawl card `text`), item COUNT, and every label/value — captions and counts drift silently

Only write `NO_EXAMPLE / <Name>` after both:

- no rendered webpage examples exist
- no official showcase/example metadata exists

## Current Verified State

The current baseline, inventory, Figma counts, risks, and exceptions live in `checkpoint.md`. Do not duplicate mutable counts here; they become stale after component reconstruction. The known `CircularProgress` docs-only exception also remains tracked there.

Do not claim the file is still fully synced after future package/site changes until the global audit is rerun.

## When Updating The Cover

The Cover page is visual/branding work, not official component documentation.

Allowed:

- make it visually closer to the official Astryx landing page
- use official-looking navigation, wordmark, CTA, and component-showcase motifs
- update version/status text after a verified audit

Not allowed:

- change component docs based on cover design
- use the cover as a source of truth
- add invented component claims to official component pages

## Handoff Rule

If another agent continues this work:

1. Read `AGENTS.md`.
2. Read this `advise.md`.
3. Read `checkpoint.md` from the top.
4. Confirm package/site version alignment.
5. Use Astryx MCP, CLI metadata, rendered official website, and Figma MCP together.
6. Make page-scoped Figma changes only.
7. Verify separately.
8. Update `checkpoint.md` immediately after meaningful changes, but keep it short.
9. Put long audit details, component-by-component notes, and historical findings in `logs/`.

## Checkpoint And Logs Policy

Keep `checkpoint.md` compact so agents can resume work without spending excessive context on old history.

Use `checkpoint.md` for:

- current verified baseline
- current status
- active risks
- immediate next work
- links to detailed logs

Use `logs/` for:

- full audit records
- long source comparisons
- component-by-component discrepancy notes
- historical work progress
- any details that are useful but not needed on every resume

Do not append large audit sections to `checkpoint.md`. Create a dated log file instead, then add a one-line link and status summary to `checkpoint.md`.
