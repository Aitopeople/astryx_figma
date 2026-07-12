# Astryx Figma Development Advice

This directory is for maintaining the Figma mirror of the official Astryx design system.

The goal is not to create a similar-looking design system. The goal is to keep the Figma file as a 1:1 mirror of the official Astryx docs.

Figma file:

- Name: `astryx_design_system`
- Current verified baseline: Astryx `v0.1.4`
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
- helper components

If the official docs do not expose something, do not present it as official in Figma. If the official docs expose something, Figma must include it.

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

4. Preserved crawl (the practical authoritative source)
   - A full crawl of every component page is preserved at the scratchpad path recorded in `checkpoint.md` (`…/e4e5532f…/scratchpad/`).
   - `pages/<Comp>.json` → `cards[]`; each card has `title`, `text` (the full rendered text of that card), `afterExamples` (true = an Examples card, false = the hero/props region), and `shot` (PNG path). `shots/<Comp>/<n>_<Title>.png` are the visual captures.
   - **The card `text` field is the authoritative comparison source** for example content and captions — more reliable than screenshots, which abbreviate.
   - Caveat: this lives in a session temp dir and may be cleaned up. If it is gone, re-crawl before auditing; do not audit from Figma text or memory alone.

5. Figma MCP
   - Use it to inspect and modify the Figma file.
   - Always verify writes in a separate read call.

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

## Official Page Structure (do not omit sections)

Each official component page renders, in order:

1. **Usage** — a one-line description + a `ts` import code block (e.g. `import {Button} from '@astryxdesign/core/Button'`). Import paths come from `astryx component <Name> --json` → `.data.import` (exceptions exist: Checkbox→`{CheckboxInput}`, Radio→`{RadioList}`, Tabs→`{TabList}`, Toast→`{Toast}`, etc.).
2. **Best practices** — a Guidance/Practices table of Do (green) / Don't (red) rows. Not every component has one (Code/Heading/Resizable and many subcomponents are Usage-only). Source: crawl card with `title` starting "Guidance".
3. **Examples** — the titled example cards (`afterExamples: true`).

The Figma mirror represents these as an `OFFICIAL_USAGE_BEST_PRACTICES / <Name>` box plus the `EXAMPLE / …` frames. When adding/repairing a page, include all three; do not treat Usage/Best-practices as optional.

## Fast Audit Method: Text / Token Diff (preferred over screenshot-per-frame)

Screenshotting every frame is slow and can miss content drift. Instead:

1. In one read-only `use_figma` call, extract each `EXAMPLE /` frame's preview TEXT (join `findAll(TEXT).characters`) + its caption (the TEXT under the `Description` sub-frame). Batch many pages per call via `page.loadAsync()` (no `setCurrentPageAsync` needed for reads).
2. Diff the token set against the crawl card `text` (strip chrome: `Description`/`Code`/`Open in Playground`, bare day-numbers, aria-labels like `Select row`). Compare captions exactly.
3. Only screenshot-verify **structural rebuilds** (added/removed items, layout changes) — not every clean page.

This surfaced ~all drift in a fraction of the time. Run the diff in `python` (note: `python3` is not available on this Windows shell; `python` is).

## Two Drift Classes To Check

The 2026-07 full audit found drift concentrated in two predictable places (content components were consistently faithful):

1. **Example CONTENT approximated with generic placeholders** — in structural / layout / disclosure / overlay sets whose examples are scaffolding rather than real data. Confirmed cases: AspectRatio, Grid (all 4), MetadataList (all 3), Layout (Dual Panel / Sidebar Nav schematic), Collapsible (all 4), Dialog (4), CommandPalette (4), Kbd (2). Symptoms: wrong item counts, wrong values/labels, invented icons/headings.
2. **Paraphrased example CAPTIONS** — only on the aggregate pages (Chat, Navigation), where captions were shortened/reworded vs official. Fix: overwrite each caption with the exact crawl caption (last paragraph of the card `text`).

Content/data components (Table, List, all inputs, Calendar, Slider, Checkbox, Radio, Switch, Pagination, Avatar, Breadcrumbs, Badge, Text, Markdown, Toast, etc.) copied real official data correctly — audit these last, expect clean.

## Figma File Naming Conventions

- Per single-component page: `OFFICIAL_DOCS_SYNC / <Name>` (description + `PROP_ROW / <Comp>.<prop>` rows), `OFFICIAL_COMPONENTS / <Name>` (insertable reps), `OFFICIAL_EXAMPLES / <Name>` (holds `EXAMPLE / <Comp> — <Variant>` frames; note some use `Example /`). Plus `OFFICIAL_USAGE_BEST_PRACTICES / <Name>`.
- Aggregate pages (Chat, Navigation, Utilities) split into named "Chunk" frames; each documents several subcomponents (props → per-subcomponent Usage/BP box → next). Utilities uses `SECTION_TITLE /` + `PROP_ROW / <Comp> / <prop>`.
- The hero (crawl card 0, `afterExamples: false`) is **not** an example — it is the page's top showcase. Never promote it to an `EXAMPLE` unless the user explicitly asks.

## use_figma Gotchas Specific To This File

- Example `Description` sub-frames are FIXED height + `clipsContent` — when replacing a caption with longer official text, set the Description frame `primaryAxisSizingMode='AUTO'` (or captions clip).
- Expandable component instances (Collapsible, etc.) have FIXED height sized to the old content — longer official content overflows onto the next row. Set open instances (and their content TEXT) to `layoutSizingVertical='HUG'`.
- Rows that overflow horizontally (e.g. Kbd combos) need `layoutWrap='WRAP'` + `counterAxisSizingMode='AUTO'` on the row and a hug-height chain up the parents.
- `textAutoResize` enum is `NONE|WIDTH_AND_HEIGHT|HEIGHT|TRUNCATE` — there is **no `WIDTH`**.
- Edit instance content via component properties where they exist (`setProperties({'Title#34:0': …, 'Open': 'true'})`), else via nested text override; multi-char key/badge frames may need hug width to avoid wrapping.
- CLI fetches: do not bulk-fetch all pages at once (73-page fetch timed out at 7 min). Batch ~10–14 per call.

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

As of the latest global audit archived under `logs/` and summarized in `checkpoint.md`:

- Official baseline: Astryx `v0.1.4`
- Official inventory source: live sidebar, rendered Examples sections, CLI props
- Figma verified component group pages: 74
- Verified prop rows: `1425 / 1425`
- Verified example cards: `408 / 408`
- Blocking mismatches: `0`
- Archive pages/nodes: `0`
- Known exception: `CircularProgress` has a live URL but is absent from the `v0.1.4` sidebar, so it is kept as docs-only with an explicit note.

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
