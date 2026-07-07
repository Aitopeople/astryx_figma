# Astryx Figma Design System Audit Checkpoint

Date: 2026-07-03

Figma file:

- Name: `astryx_design_system`
- Reviewed node link context: `50:2`

Version alignment:

- `@astryxdesign/core`: `0.1.2`
- `@astryxdesign/cli`: `0.1.2`
- npm registry latest for both packages: `0.1.2`
- `npm install` completed successfully; dependency tree was already up to date.

MCP/tool status:

- The configured `xds` MCP server is registered in Codex CLI and reachable over HTTP MCP.
- Codex tool registry still does not expose `mcp__xds__...` as a native callable namespace in this session.
- Direct JSON-RPC calls to `https://astryx.atmeta.com/mcp` work.
- Astryx MCP server response: `serverInfo.name = "astryx"`, `version = "2.0.0"`.
- Astryx MCP tools available by direct MCP call: `search`, `get`.
- Figma MCP is callable and was used to inspect the Figma file.
- Figma Code Connect metadata was blocked by Figma seat permissions.
- Authoritative official docs source for future work: Astryx MCP `get` tool first; fallback to installed official Astryx metadata exposed by `npx astryx component <Name> --json`.

## Non-Negotiable Rule

The Figma file must be a 100% mirror of the official Astryx docs.

This means:

- Do not invent components.
- Do not invent subcomponents.
- Do not invent helper components.
- Do not invent documentation sections.
- Do not preserve existing Figma prose as source material.
- Do not paraphrase or simplify official property descriptions.
- Do not treat Figma component properties as official React properties.
- Do not expose construction artifacts as part of the design-system documentation.
- After official docs text sync is complete, the actual Figma components must also be created or corrected to match the official Astryx components.
- Creating the component alone is not enough: each official docs example/type/variant shown in the Astryx docs must also be implemented clearly in Figma.
- Example implementation must follow the official docs examples exactly. If the docs show `Badge — Colors`, `Badge — Counts`, and `Badge — Status`, the Figma page must include those example compositions, not just the base `Badge` component.
- Do not invent extra examples, omit official examples, or merge distinct official examples into a simplified showcase.

Every component page must be regenerated from official Astryx component metadata only.

Official docs grouping must be preserved:

- If the official docs group related entries under one navigation/page, Figma must use the same page grouping.
- Do not split grouped official docs into arbitrary separate Figma pages.
- Do not merge unrelated official docs pages into arbitrary combined Figma pages.
- Figma page names and grouping must follow the official docs navigation exactly.
- Page names such as `Navigation (Tabs · Breadcrumbs · Pagination)` or `List & Content (Item · List · Token · Link · Timestamp)` are not acceptable unless the official docs use that exact grouping.
- Example: the official `Collapsible` docs group contains `Collapsible`, `CollapsibleGroup`, and `useCollapsible`; Figma should create one `Collapsible` page and place those official entries inside that page.
- Apply the same rule to other grouped docs that contain components, subcomponents, and hooks.

Current Figma page grouping issues to fix:

- `Navigation (Tabs · Breadcrumbs · Pagination)`
- `List & Content (Item · List · Token · Link · Timestamp)`
- `Overlays (Popover · HoverCard · ContextMenu · MoreMenu)`
- `Disclosure & Data (Collapsible · MetadataList · OverflowList · TreeList)`
- Any other page whose name combines multiple official docs pages or categories not combined that way by official docs.

Required action:

- Rebuild page structure from official docs navigation.
- Use official docs page/group names only.
- Move each component, subcomponent, and hook under the same page/group where it appears in official docs.

For every official component page, include the official React props/properties exactly as available:

- prop name
- type/options
- required status
- default value
- official description

Valid source for property text:

- `npx astryx component <Name> --json`
- Astryx docs MCP, only after it becomes callable in the session
- Official Astryx component webpage, especially the Examples section, must be checked directly for every component page.

Invalid sources for property text:

- existing Figma text
- Figma component properties
- inferred behavior
- agent-written summaries
- convenience wording

Critical examples/source rule:

- Do not rely only on Astryx MCP `get` for examples.
- Astryx MCP `get` can omit examples that appear on the official component webpage.
- For every component, inspect the official webpage at `https://astryx.atmeta.com/components/<ComponentName>` and compare the full `Examples` section against Figma.
- Figma must implement every official webpage example, not just the examples returned by MCP.
- If MCP and the official webpage disagree or MCP is incomplete, the official webpage wins for example coverage.
- Record any MCP-vs-webpage discrepancy in this checkpoint.
- Do not conclude that a component has no official examples from a simple HTML-to-text scrape alone.
- Official Astryx pages can expose examples in at least two different ways:
  - Visible prose headings under an `Examples` section, such as `Badge — Colors`.
  - Next/RSC payload metadata under `showcase`, with fields such as `dirName`, `name`, `displayName`, `description`, `exampleFor`, `componentsUsed`, and `source`.
- Before marking examples as absent, check all of the following:
  - MCP `get(<ComponentName>).moreExamples`
  - Official webpage text after script/style removal
  - Raw HTML/RSC payload for `"showcase":`, `"exampleFor":"<ComponentName>"`, and `"displayName"`
  - Raw HTML/RSC payload for escaped strings such as `\\u003c`, `\\u003e`, `\\"`, and embedded component source
  - Official page navigation/sidebar to identify grouped sibling components and hooks
- If a page has no visible `Examples` heading but has `showcase.exampleFor`, the `showcase` entry is an official example and must be implemented in Figma.
- Only write “no official examples” after both visible Examples extraction and raw payload/showcase extraction return no entries.
- When an official example is represented by showcase metadata rather than a visible `Component — Variant` heading, use the official `displayName` as the example title and record that it came from showcase metadata.
- For grouped docs, check every group member page separately; examples can live on member pages rather than the group name.
- Known discrepancy pattern:
  - `Badge`: MCP did not return all official webpage examples.
  - `TextArea`: MCP did not expose the complete official webpage examples; implementation had to be corrected.
  - `TextInput`: must be rechecked against the official webpage because the same mistake may have occurred.
  - `Navigation`: simple text extraction missed official showcase metadata; corrected by parsing raw page payload for `showcase.exampleFor`.

Required webpage extraction checklist before Figma writes:

1. Fetch `https://astryx.atmeta.com/components/<ComponentName>`.
2. Record HTTP status and page length; if status is 404, confirm with MCP `get` whether the name is a group member, hook, or non-public entry.
3. Extract visible text and scan for `Overview`, `Props`, `Examples`, `Description`, `Code`, and example headings.
4. Parse raw HTML/RSC payload for official showcase metadata:
   - Search for `"showcase":`
   - Search for `"exampleFor":"<ComponentName>"`
   - Extract `displayName`, `description`, `componentsUsed`, and `source` when present.
5. Compare the visible examples, showcase examples, and MCP `moreExamples`.
6. Treat the union of visible official examples and showcase metadata examples as the required Figma example set.
7. If examples are still empty, record exactly which checks were performed before saying no examples exist.
8. After Figma writes, validate:
   - Expected prop row count
   - Expected component count
   - Expected example card count
   - Every expected example title or showcase display name
   - No examples invented for entries that truly have none

## Current Coverage Snapshot

Official public component count from installed Astryx metadata:

- 148

Exact official component/component-set names currently found in Figma:

- 133

Exact-name missing from Figma:

- 15

Missing official entries:

- `BaseTypeahead`
- `CollapsibleGroup`
- `CommandPaletteList`
- `DialogHeader`
- `Field`
- `Icon`
- `LayoutContent`
- `LayoutFooter`
- `LayoutHeader`
- `LayoutPanel`
- `LinkProvider`
- `ListItem`
- `Theme`
- `ToggleButtonGroup`
- `TypeaheadItem`

Important correction:

- `Heading` is official. `npx astryx component Heading --json` returns official docs with `subComponentOf: Text`.
- Keep `Heading`, but rewrite its page text from official metadata only.

## Figma MCP Page Grouping Audit

Figma MCP was used to read all current page names. The current file contains many arbitrary page groupings that do not mirror official docs navigation.

Current Figma pages that are clearly grouped arbitrarily:

- `Primitives (Spinner · StatusDot · Divider · Kbd)`
- `Selection Controls (Switch · Checkbox · Radio)`
- `Inputs (TextInput · TextArea)`
- `Controls & Feedback (Segmented · Slider · Progress · Skeleton)`
- `Feedback (Banner · Toast · Tooltip · EmptyState)`
- `Selector · DropdownMenu`
- `Navigation (Tabs · Breadcrumbs · Pagination)`
- `List & Content (Item · List · Token · Link · Timestamp)`
- `Overlays (Popover · HoverCard · ContextMenu · MoreMenu)`
- `Disclosure & Data (Collapsible · MetadataList · OverflowList · TreeList)`
- `Date & Number Inputs`
- `SideNav`
- `TopNav · AppShell · MobileNav`
- `Content (Heading · Text · Blockquote · CodeBlock · Citation)`
- `Advanced Selection (Typeahead · Tokenizer · MultiSelector · PowerSearch)`
- `Media (Thumbnail · AspectRatio · Overlay · Lightbox · Carousel)`
- `Field & Choice Lists (Field · InputGroup · CheckboxList · RadioList)`
- `Chat — Messages`
- `Chat — Composer & Layout`
- `Layout (Stack · Grid · Layout · Section · Center · FormLayout)`
- `Misc (AvatarGroup · Toolbar · Outline · Nav extras)`
- `Utilities (Markdown · Theme · MediaTheme · LinkProvider)`

Why these are wrong:

- They combine multiple official docs entries into one Figma page using arbitrary labels, parentheses, dots, ampersands, or dashes.
- They do not preserve the official docs navigation/page structure.
- They make the Figma file read like a redesigned taxonomy instead of a 1:1 official docs mirror.

Required action:

- Rebuild Figma pages from official docs navigation.
- Use official docs group/page names only.
- If official docs place multiple entries under one page, keep them together under that official page.
- If official docs list entries separately, do not merge them into a made-up combined page.
- Do not use broad invented labels such as `Primitives`, `Controls & Feedback`, `List & Content`, `Advanced Selection`, or `Misc`.

## Official But Missing Or Not First-Class

These must be added or promoted as official docs/pages/components exactly as Astryx documents them.

### `Field`

Current issue:

- Figma has `FieldLabel`, `FieldStatus`, and `InputGroup`.
- The official `Field` wrapper itself is not represented as a first-class official component page.

Required official props include:

- `label`
- `inputID`
- `children`
- `isLabelHidden`
- `isDisabled`
- `description`
- `descriptionID`
- `isOptional`
- `isRequired`
- `labelIcon`
- `labelTooltip`
- `status`
- `statusVariant`
- `width`
- `ref`
- `xstyle`
- `className`
- `style`

### `ToggleButtonGroup`

Current issue:

- Figma has `ToggleButton`.
- Official `ToggleButtonGroup` is missing as a first-class official entry.

Required official props include:

- `children`
- `label`
- `type`
- `value`
- `onChange`
- `orientation`
- `size`
- `isDisabled`
- `xstyle`
- `data-testid`

### `DialogHeader`

Current issue:

- Figma has `Dialog` and `AlertDialog`.
- Official `DialogHeader` is missing as a first-class official entry.

Required official props include:

- `title`
- `subtitle`
- `onOpenChange`
- `startContent`
- `endContent`
- `hasDivider`

### `CommandPaletteList`

Current issue:

- Figma has `CommandPalette`, `CommandPaletteInput`, `CommandPaletteItem`, `CommandPaletteGroup`, `CommandPaletteFooter`, and `CommandPaletteEmpty`.
- Official `CommandPaletteList` is missing as a first-class official entry.

Required official props include:

- `children`
- `label`
- `xstyle`

### `CollapsibleGroup`

Current issue:

- Figma has `Collapsible`.
- Official `CollapsibleGroup` is missing as a first-class official entry.

Required official props include:

- `type`
- `defaultValue`
- `value`
- `onChange`
- `children`

### Layout Compound Components

Current issue:

- Figma has `Layout`.
- Official compound components are missing as first-class official entries.

Missing official entries:

- `LayoutHeader`
- `LayoutContent`
- `LayoutFooter`
- `LayoutPanel`

Required official props:

- `LayoutHeader`: `children`, `hasDivider`, `height`, `label`, `role`
- `LayoutContent`: `children`, `isScrollable`, `label`, `role`
- `LayoutFooter`: `children`, `hasDivider`, `height`, `label`, `role`
- `LayoutPanel`: `children`, `hasDivider`, `isScrollable`, `label`, `role`

### `ListItem`

Current issue:

- Figma has `Item` and `List`.
- Official `ListItem` is missing as a first-class official entry.

Required official props include:

- `label`
- `description`
- `startContent`
- `endContent`
- `onClick`
- `href`
- `target`
- `rel`
- `isDisabled`
- `isSelected`

### Typeahead Subcomponents

Current issue:

- Figma has `Typeahead`.
- Official `BaseTypeahead` and `TypeaheadItem` are missing as first-class official entries.

Required official entries:

- `BaseTypeahead`
- `TypeaheadItem`

Known official `BaseTypeahead` props include:

- `searchSource`
- `value`
- `onChange`
- `renderItem`
- `placeholder`
- `hasEntriesOnFocus`
- `maxMenuItems`
- `emptySearchResultsText`
- `isDisabled`
- `hasAutoFocus`
- `debounceMs`
- `anchorRef`

Known official `TypeaheadItem` props include:

- `item`
- `icon`
- `description`
- `isDisabled`
- `group`

### Utilities

Current issue:

- `Theme` and `LinkProvider` are currently only mentioned as text.
- They must be represented exactly as official utility components, not as informal notes.

Required official entries:

- `Theme`
- `LinkProvider`

Known official `Theme` props:

- `theme`
- `mode`
- `children`

Known official `LinkProvider` props:

- `component`
- `children`

### `Icon`

Current issue:

- Figma has individual glyph components such as `Icon/check`, `Icon/search`, and `Icon/close`.
- Official public component is `Icon`.
- A representative official `Icon` entry is missing.

Required official props:

- `icon`
- `color`
- `size`

Individual glyph components must not be documented as official Astryx components. The official docs target is `Icon`.

## Figma Entries Not Matching Official Public Surface

These currently appear in Figma but must not be documented as independent official components unless official Astryx docs explicitly expose them.

### Component Sets

- `CalendarDay`
  - Official docs target: `Calendar`
  - Required action: remove from public component/docs surface unless official docs expose `CalendarDay`.
- `PaginationItem`
  - Official docs target: `Pagination`
  - Required action: remove from public component/docs surface unless official docs expose `PaginationItem`.
- `Radio`
  - Official docs target: `RadioList` and `RadioListItem`
  - Required action: remove standalone public `Radio` unless official docs expose it.
- `TreeListItem`
  - Official docs target: `TreeList`
  - Required action: remove from public component/docs surface unless official docs expose `TreeListItem`.

### Top-Level Components

- `MobileNavToggle`
  - Official docs target: `MobileNav`
  - Required action: remove from public component/docs surface unless official docs expose `MobileNavToggle`.

### Icon Glyph Components

These are present as top-level Figma components, but the official public docs target is `Icon`, not individual glyph entries:

- `Icon/arrowDown`
- `Icon/arrowUp`
- `Icon/arrowsUpDown`
- `Icon/calendar`
- `Icon/check`
- `Icon/checkDouble`
- `Icon/chevronDown`
- `Icon/chevronLeft`
- `Icon/chevronRight`
- `Icon/clock`
- `Icon/close`
- `Icon/copy`
- `Icon/error`
- `Icon/externalLink`
- `Icon/eyeSlash`
- `Icon/funnel`
- `Icon/info`
- `Icon/menu`
- `Icon/microphone`
- `Icon/moreHorizontal`
- `Icon/search`
- `Icon/stop`
- `Icon/success`
- `Icon/viewColumns`
- `Icon/warning`
- `Icon/wrench`

Required action:

- Do not present these as separate official component docs.
- Use official `Icon` docs and properties only.

## Component-Specific Checks

### `Pagination`

Current status:

- Official `Pagination` exists in Figma.
- Figma also has `PaginationItem`, which is not official public docs surface in installed metadata.

Official `Pagination` props include:

- `page`
- `onChange`
- `changeAction`
- `totalItems`
- `totalPages`
- `hasMore`
- `pageSize`
- `pageSizeOptions`
- `onPageSizeChange`
- `variant`
- `siblingCount`
- `size`
- `isDisabled`
- `label`
- `xstyle`

Official `variant` values:

- `pages`
- `count`
- `compact`
- `dots`
- `none`

Required action:

- Rewrite the Pagination page from official `Pagination` metadata.
- Do not document `PaginationItem` as public API.

### `Button`

Current status:

- `Button`, `IconButton`, `ToggleButton`, and `ButtonGroup` exist.
- `ToggleButtonGroup` is missing.
- Existing Figma documentation text must be ignored and regenerated from official metadata.

Known official `Button` props include:

- `label`
- `variant`
- `size`
- `type`
- `name`
- `value`
- `form`
- `isLoading`

Required action:

- Rebuild page documentation from official `Button`, `ButtonGroup`, `IconButton`, `ToggleButton`, and `ToggleButtonGroup` metadata.

### `Badge`

Current status:

- `Badge` exists in Figma.
- Existing Figma documentation text must be ignored and regenerated from official metadata.

Known official `Badge` props:

- `variant`
- `label`
- `icon`

Required action:

- Rewrite page documentation from official `Badge` metadata.

### `TextInput`

Current status:

- `TextInput` exists in Figma.
- Existing Figma documentation text must be ignored and regenerated from official metadata.

Required action:

- Rewrite page documentation from official `TextInput` metadata.

## Token And Foundation Checks

These are token/name checks, not component props.

Potential variable naming mismatches:

- Figma currently has `color/border-emphasized`.
  - Official CSS variable syntax: `var(--color-border-emphasized)`.
  - Verify against official token docs before renaming.
- Figma currently has `border-width`.
  - Official CSS variable syntax: `var(--border-width)`.
  - Verify against official token docs before renaming.

Token values observed earlier:

- Color collection: 79 variables with Light/Dark modes.
- Spacing, Shape, Typography, and Motion values mostly matched official docs.
- Text styles: 14 styles matched the Astryx type scale.
- Effect styles: 8 styles matched Shadow/Inset families.

Effect caveat:

- Figma effect styles are static effects.
- Verify official intended light/dark behavior before treating them as complete.

## Required Rebuild Workflow

For each official component:

1. Read official component metadata with `npx astryx component <Name> --json`.
2. Extract official description, props, usage, anatomy, examples, and best practices where present.
3. Ignore existing Figma page prose.
4. Rebuild the Figma page text from the official metadata only.
5. Ensure all props include name, type/options, required/default status, and official description.
6. Ensure the Figma public surface contains only official docs entries.
7. Remove or hide any non-official component/docs entries from the public component surface.

## 2026-07-03 Work Progress

Astryx MCP status:

- Direct HTTP MCP calls to `https://astryx.atmeta.com/mcp` are working.
- `tools/list` returned `search` and `get`.
- `get` is being used as the primary official docs source.

Figma MCP status:

- Figma MCP is being used for file inspection and writing.
- Important implementation note: separate Figma MCP write calls can behave like snapshot updates; to avoid earlier docs frames disappearing, batch related page updates in a single `_use_figma` transaction.

Page structure work completed:

- Arbitrary grouped pages were archived with `ARCHIVE / ...` prefix.
- Official docs-style pages were created from official Astryx metadata group names.

Official docs sync frames currently verified in Figma:

- `Badge`
- `Button`
- `Collapsible`
- `CommandPalette`
- `Dialog`
- `Field`
- `Layout`
- `Pagination`
- `Table`
- `TextArea`
- `TextInput`

Current limitation:

- A second Figma write confirmed the snapshot behavior: after writing `Pagination`, `Collapsible`, and `Dialog`, the previous `Button`, `Badge`, `TextInput`, `TextArea`, and `Field` sync frames disappeared.
- A later verification returned zero `OFFICIAL_DOCS_SYNC` frames when using broad multi-page writes, so broad Figma MCP writes in this session must be treated as snapshot-prone.
- A page-scoped write using `await figma.setCurrentPageAsync(page)` was tested on `Badge` and persisted across a separate read-only verification.
- Previously generated but no longer present after the snapshot overwrite:
  - `Button` page includes `Button`, `ButtonGroup`, `IconButton`, `ToggleButton`, and `ToggleButtonGroup`.
  - `TextInput` page includes official `TextInput` props.
  - `TextArea` page includes official `TextArea` props.
  - `Field` page includes official `Field` props.
- Currently present:
  - `Badge` page includes official `Badge` props from Astryx MCP `get`.
  - `Badge` page was corrected to include official examples from the Astryx site:
    - `Badge — Variants`
    - `Badge — Colors`
    - `Badge — Counts`
    - `Badge — Status`
  - Important Badge caveat: Astryx MCP `get("Badge")` returned `Badge — Variants` and `Badge — Colors`, but did not return the official site examples `Badge — Counts` and `Badge — Status`. The Figma page was updated using the official site text supplied by the user, and this is a signal that MCP `get` alone may not expose every docs example.
  - `Badge` actual Figma implementation work completed:
    - Existing local `Badge` component set with 14 variants was reused.
    - `OFFICIAL_EXAMPLES / Badge` frame was created on the `Badge` page.
    - Official examples implemented as real Badge component instances:
      - `Badge — Colors`
      - `Badge — Counts`
      - `Badge — Status`
    - Validation confirmed all expected example labels/descriptions exist and screenshot verification showed the examples render without obvious overlap.
  - `Button` page includes official `Button`, `ButtonGroup`, `IconButton`, `ToggleButton`, and `ToggleButtonGroup` props from Astryx MCP `get`.
  - `Button` actual Figma implementation work started:
    - Existing local `Button` component set was reused for official examples.
    - `OFFICIAL_EXAMPLES / Button` frame was created on the `Button` page.
    - Official examples implemented as real component instance compositions:
      - `Button — Variants`
      - `Button — End Slot`
    - Validation confirmed expected labels/descriptions exist and screenshot verification showed the examples render without obvious overlap.
    - Caveat: the current Figma `Button` component set does not yet expose the official `endContent` slot as a proper Figma component property. The `Button — End Slot` example is implemented as a Button instance plus adjacent Badge instance composition and must later be corrected into a true end-slot/component-property implementation.
  - `Collapsible` page includes official `Collapsible`, `CollapsibleGroup`, and `useCollapsible` docs from Astryx MCP `get`.
  - `Collapsible` actual Figma implementation work completed:
    - Archived local `Collapsible` component set was promoted from `ARCHIVE / Disclosure & Data (Collapsible · MetadataList · OverflowList · TreeList)` to the official `Collapsible` page.
    - Corrected against the official Collapsible page at `https://astryx.atmeta.com/components/Collapsible`.
    - `OFFICIAL_EXAMPLES / Collapsible` frame was created on the `Collapsible` page.
    - Complete official examples implemented as real component instance compositions:
      - `Collapsible — Controlled`
      - `Collapsible — Multiple Mode`
      - `Collapsible — Single Mode`
      - `Collapsible — With Dividers`
    - Validation confirmed all official example headings/labels exist and screenshot verification showed the examples render without obvious overlap.
    - Caveat: `CollapsibleGroup` and `useCollapsible` are documented on the page, but the Figma component-property model for group coordination (`type`, `value`, `defaultValue`) still needs a dedicated component-property pass.
  - `CommandPalette` page includes official `CommandPalette`, `CommandPaletteInput`, `CommandPaletteList`, `CommandPaletteItem`, `CommandPaletteGroup`, `CommandPaletteFooter`, and `CommandPaletteEmpty` props from Astryx MCP `get`.
  - `CommandPalette` actual Figma implementation work completed:
    - Corrected against the official CommandPalette page at `https://astryx.atmeta.com/components/CommandPalette`.
    - `OFFICIAL_EXAMPLES / CommandPalette` frame was created on the `CommandPalette` page.
    - Complete official examples implemented as command palette compositions:
      - `CommandPalette — Async Search`
      - `CommandPalette — Grouped`
      - `CommandPalette — Custom Footer`
      - `CommandPalette — Picker Mode`
      - `CommandPalette — Rich Items`
    - Validation confirmed all official example headings/labels exist and screenshot verification showed the examples render without obvious overlap after resizing the examples frame.
    - Caveat: command palette examples are static compositions. Search, async loading, picker state, grouping, and keyboard interaction need a future component-property/prototype pass.
  - `DateInput` page now includes official `DateInput`, `DateRangeInput`, and `DateTimeInput` props from Astryx MCP `get`.
  - `DateInput` actual Figma implementation work completed:
    - Archived local `DateInput`, `DateRangeInput`, and `DateTimeInput` components were promoted from `ARCHIVE / Date & Number Inputs` to the official `DateInput` page.
    - Corrected against the official webpages:
      - `https://astryx.atmeta.com/components/DateInput`
      - `https://astryx.atmeta.com/components/DateRangeInput`
      - `https://astryx.atmeta.com/components/DateTimeInput`
    - `OFFICIAL_DOCS_SYNC / DateInput` was created with all 69 official prop rows across the three group members, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / DateInput` was created with complete official webpage examples:
      - `DateInput — Clearable`
      - `DateInput — Min/Max Constraints`
      - `DateInput — Description`
      - `DateInput — Validation`
      - `DateRangeInput — With Presets`
      - `DateRangeInput — Validation`
      - `DateTimeInput — Validation`
    - Validation confirmed all required group members, representative props, and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Calendar popovers, date constraints, presets, min/max enforcement, clear actions, and validation interactions need a future component-property/prototype pass.
  - `Dialog` page includes official `Dialog`, `DialogHeader`, and `AlertDialog` props from Astryx MCP `get`.
  - `Dialog` actual Figma implementation work completed:
    - Existing local `Dialog` and `AlertDialog` components on the official `Dialog` page were reused where possible.
    - Corrected against the official Dialog page at `https://astryx.atmeta.com/components/Dialog`.
    - `OFFICIAL_EXAMPLES / Dialog` frame was created on the `Dialog` page.
    - Complete official examples implemented as real component/composition examples:
      - `Dialog — Confirmation`
      - `Dialog — Form`
      - `Dialog — Fullscreen`
      - `Dialog — Scrollable`
      - `Dialog — Required`
    - Validation confirmed all official example headings/labels exist and screenshot verification showed the examples render without obvious overlap after resizing the examples frame.
    - Caveat: `DialogHeader` is documented but is still not represented as a proper standalone Figma component. Form, fullscreen, scrollable, and required examples use manual dialog compositions where official component properties are not yet exposed.
  - `Field` page includes official `Field` props from Astryx MCP `get`.
  - `Field` actual Figma implementation work completed:
    - Local `Field` component was created on the official `Field` page because the official wrapper was missing as a first-class Figma component.
    - `OFFICIAL_EXAMPLES / Field` frame was created on the `Field` page.
    - Initial implementation was incomplete because it used Astryx MCP `example/moreExamples` instead of checking the official website page directly.
    - Corrected against the official Field page at `https://astryx.atmeta.com/components/Field`.
    - Complete official examples implemented as real component instance compositions:
      - `Field — Required & Optional`
      - `Field — Validation States`
      - `Field — Description`
    - Validation confirmed expected labels/descriptions exist and screenshot verification showed the examples render without obvious overlap.
    - Caveat: the current Figma `Field` component is a structural wrapper draft and does not yet expose the official `children`, `status`, `statusVariant`, `labelTooltip`, and related props as proper Figma component properties. This must be corrected in the component-property pass.
  - `FileInput` page now includes official `FileInput` props from Astryx MCP `get`.
  - `FileInput` actual Figma implementation work completed:
    - Archived local `FileInput` component was promoted from `ARCHIVE / Date & Number Inputs` to the official `FileInput` page.
    - Corrected against the official FileInput page at `https://astryx.atmeta.com/components/FileInput`.
    - `OFFICIAL_DOCS_SYNC / FileInput` was created with all 19 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / FileInput` was created with the complete official webpage example:
      - `FileInput — Basic`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Native file picker behavior, drag-and-drop mode, validation for type/size/count, loading state, and async upload feedback need a future component-property/prototype pass.
  - `Layout` page includes official `Layout`, `LayoutHeader`, `LayoutContent`, `LayoutFooter`, and `LayoutPanel` props from Astryx MCP `get`.
  - `Layout` actual Figma implementation work completed:
    - Archived local `Layout` component was promoted from `ARCHIVE / Layout (Stack · Grid · Layout · Section · Center · FormLayout)` to the official `Layout` page.
    - Corrected against the official Layout page at `https://astryx.atmeta.com/components/Layout`.
    - `OFFICIAL_EXAMPLES / Layout` frame was created on the `Layout` page.
    - Complete official examples implemented as layout compositions:
      - `Layout — Basic Card`
      - `Layout — Content Only`
      - `Layout — Content Width`
      - `Layout — Dual Panel`
      - `Layout — Full Bleed Content`
      - `Layout — Sidebar Navigation`
    - Validation confirmed all official example headings exist and screenshot verification showed the examples render without obvious overlap after resizing the examples frame.
    - Caveat: `LayoutHeader`, `LayoutContent`, `LayoutFooter`, and `LayoutPanel` are documented but still need proper standalone Figma component/property modeling beyond the static layout compositions.
  - `NumberInput` page now includes official `NumberInput` props from Astryx MCP `get`.
  - `NumberInput` actual Figma implementation work completed:
    - Archived local `NumberInput` component was promoted from `ARCHIVE / Date & Number Inputs` to the official `NumberInput` page.
    - Corrected against the official NumberInput page at `https://astryx.atmeta.com/components/NumberInput`.
    - `OFFICIAL_DOCS_SYNC / NumberInput` was created with all 27 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / NumberInput` was created with complete official webpage examples:
      - `NumberInput — Clearable`
      - `NumberInput — Range Constrained`
      - `NumberInput — Status Variants`
      - `NumberInput — With Units`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Stepper controls, min/max validation, clear action, unit suffix behavior, and keyboard interactions need a future component-property/prototype pass.
  - `TimeInput` page now includes official `TimeInput` props from Astryx MCP `get`.
  - `TimeInput` actual Figma implementation work completed:
    - Archived local `TimeInput` component was promoted from `ARCHIVE / Date & Number Inputs` to the official `TimeInput` page.
    - Corrected against the official TimeInput page at `https://astryx.atmeta.com/components/TimeInput`.
    - `OFFICIAL_DOCS_SYNC / TimeInput` was created with all 22 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / TimeInput` was created with complete official webpage examples:
      - `TimeInput — Constrained`
      - `TimeInput — Formats`
      - `TimeInput — Increment`
      - `TimeInput — States`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Min/max rejection, arrow-key increment behavior, format parsing, clear actions, loading, and validation interactions need a future component-property/prototype pass.
  - `Pagination` page includes official `Pagination` props from Astryx MCP `get`.
  - `Pagination` actual Figma implementation work completed:
    - Archived local `Pagination` component was promoted from `ARCHIVE / Navigation (Tabs · Breadcrumbs · Pagination)` to the official `Pagination` page.
    - `OFFICIAL_EXAMPLES / Pagination` frame was created on the `Pagination` page.
    - Initial implementation was incomplete because it used Astryx MCP `example/moreExamples` instead of checking the official website page directly.
    - Corrected against the official Pagination page at `https://astryx.atmeta.com/components/Pagination`.
    - Complete official examples implemented as real component/composition examples:
      - `Pagination — Dots Carousel`
      - `Pagination — Page Size Selector`
      - `Pagination — With Table`
    - Validation confirmed expected labels/descriptions exist and screenshot verification showed the examples render without obvious overlap.
    - Caveat: the current Figma `Pagination` component only represents the pages-style pagination. Official variants `dots`, `compact`, `count`, and `none` are not exposed as proper Figma component variants/properties yet. The examples use composition/manual visuals for non-pages variants and must later be corrected into true Pagination variants.
  - `Radio` page now includes official `RadioList` and `RadioListItem` props from Astryx MCP `get`.
  - `Radio` actual Figma implementation work completed:
    - Official `Radio` group was confirmed; `Radio` itself is not an exact public component name and `https://astryx.atmeta.com/components/Radio` returns 404.
    - Archived local `RadioList` and `RadioListItem` components were promoted from archived grouped pages to the official `Radio` page.
    - Corrected against the official webpages:
      - `https://astryx.atmeta.com/components/RadioList`
      - `https://astryx.atmeta.com/components/RadioListItem`
    - `OFFICIAL_DOCS_SYNC / Radio` was created with all 21 official prop rows across the two group members, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Radio` was created with complete official webpage examples:
      - `RadioList — Horizontal Layout`
      - `RadioList — Pricing Tier`
      - `RadioList — With Descriptions`
      - `RadioList — With Validation`
      - `RadioListItem — Basic`
    - Validation confirmed all required group members, representative props, and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Single-selection behavior, horizontal orientation layout behavior, startContent/endContent slots, disabled handling, and validation interactions need a future component-property/prototype pass.
  - `Switch` page now includes official `Switch` props from Astryx MCP `get`.
  - `Switch` actual Figma implementation work completed:
    - Archived local `Switch` component set was promoted from `ARCHIVE / Selection Controls (Switch · Checkbox · Radio)` to the official `Switch` page.
    - Corrected against the official Switch page at `https://astryx.atmeta.com/components/Switch`.
    - `OFFICIAL_DOCS_SYNC / Switch` was created with all 19 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Switch` was created with complete official webpage examples:
      - `Switch — Disabled`
      - `Switch — Settings Panel`
      - `Switch — With Description`
      - `Switch — With Status`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Immediate toggle behavior, async changeAction loading, disabledMessage tooltip behavior, spread label spacing, and validation interactions need a future component-property/prototype pass.
  - `Slider` page now includes official `Slider` props from Astryx MCP `get`.
  - `Slider` actual Figma implementation work completed:
    - Archived local `Slider` component was promoted from `ARCHIVE / Controls & Feedback (Segmented · Slider · Progress · Skeleton)` to the official `Slider` page.
    - Corrected against the official Slider page at `https://astryx.atmeta.com/components/Slider`.
    - `OFFICIAL_DOCS_SYNC / Slider` was created with all 21 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Slider` was created with complete official webpage examples:
      - `Slider — Formatted Value`
      - `Slider — Range`
      - `Slider — With Marks`
      - `Slider — Validation States`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Drag behavior, range thumb constraints, mark interaction, value display tooltip/text behavior, vertical orientation, and validation feedback need a future component-property/prototype pass.
  - `SegmentedControl` page now includes official `SegmentedControl` and `SegmentedControlItem` props from Astryx MCP `get`.
  - `SegmentedControl` actual Figma implementation work completed:
    - Archived local `SegmentedControl` and `SegmentedControlItem` components were promoted from `ARCHIVE / Controls & Feedback (Segmented · Slider · Progress · Skeleton)` to the official `SegmentedControl` page.
    - Corrected against the official webpages:
      - `https://astryx.atmeta.com/components/SegmentedControl`
      - `https://astryx.atmeta.com/components/SegmentedControlItem`
    - `OFFICIAL_DOCS_SYNC / SegmentedControl` was created with all 14 official prop rows across the two group members, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / SegmentedControl` was created with complete official webpage examples:
      - `SegmentedControl — Disabled Item`
      - `SegmentedControl — Fill Layout`
      - `SegmentedControl — Icon Only`
      - `SegmentedControl — With Icons`
      - `SegmentedControlItem — Basic`
    - Validation confirmed all required group members, representative props, and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Controlled selection, fill layout sizing, icon-only hidden label behavior, per-item disabled state, and icon slot fidelity need a future component-property/prototype pass.
  - `Skeleton` page now includes official `Skeleton` props from Astryx MCP `get`.
  - `Skeleton` actual Figma implementation work completed:
    - Archived local `Skeleton` component set was promoted from `ARCHIVE / Controls & Feedback (Segmented · Slider · Progress · Skeleton)` to the official `Skeleton` page.
    - Corrected against the official Skeleton page at `https://astryx.atmeta.com/components/Skeleton`.
    - `OFFICIAL_DOCS_SYNC / Skeleton` was created with all 4 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Skeleton` was created with complete official webpage examples:
      - `Skeleton — Card Loading`
      - `Skeleton — Staggered List`
      - `Skeleton — Table Rows`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Shimmer animation timing, `index` stagger behavior, and exact radius token binding need a future component-property/prototype pass.
  - `Progress` official-name correction completed:
    - `Progress` is not an exact Astryx public component name.
    - Astryx MCP suggested official components including `ProgressBar`, `CircularProgress`, `Spinner`, and `Stepper`.
    - Do not create or document a public `Progress` component page unless official docs expose that exact component.
  - `ProgressBar` page now includes official `ProgressBar` props from Astryx MCP `get`.
  - `ProgressBar` actual Figma implementation work completed:
    - Archived local `ProgressBar` component set was promoted from `ARCHIVE / Controls & Feedback (Segmented · Slider · Progress · Skeleton)` to the official `ProgressBar` page.
    - Corrected against the official ProgressBar page at `https://astryx.atmeta.com/components/ProgressBar`.
    - `OFFICIAL_DOCS_SYNC / ProgressBar` was created with all 10 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / ProgressBar` was created with complete official webpage examples:
      - `ProgressBar — Custom Format`
      - `ProgressBar — Indeterminate`
      - `ProgressBar — Semantic Variants`
      - `ProgressBar — With Value Label`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Indeterminate animation, custom value formatting, semantic variant binding, and disabled behavior need a future component-property/prototype pass.
  - `CircularProgress` page now includes official `CircularProgress` props from Astryx MCP `get`.
  - `CircularProgress` actual Figma implementation work completed:
    - Corrected against the official CircularProgress page at `https://astryx.atmeta.com/components/CircularProgress`.
    - `OFFICIAL_DOCS_SYNC / CircularProgress` was created with all 8 official prop rows, including prop name, type/options, required/default, and official description.
    - The official CircularProgress webpage did not expose an `Examples` section, so no `OFFICIAL_EXAMPLES / CircularProgress` frame was created.
    - Validation confirmed all required props exist and confirmed that no invented examples frame exists.
    - Caveat: the representative ring visual is static. Indeterminate spinning, ring arc/value mapping, center children, size variants, and semantic variants need a future component-property/prototype pass.
  - `Spinner` page now includes official `Spinner` props from Astryx MCP `get`.
  - `Spinner` actual Figma implementation work completed:
    - Corrected against the official Spinner page at `https://astryx.atmeta.com/components/Spinner`.
    - `OFFICIAL_DOCS_SYNC / Spinner` was created with all 5 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Spinner` was created with complete official webpage examples:
      - `Spinner — On Media Shade`
      - `Spinner — Sizes`
      - `Spinner — With Label`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Spinner rotation animation, shade token binding, aria-label behavior, and rich label rendering need a future component-property/prototype pass.
  - `Banner` page now includes official `Banner` props from Astryx MCP `get`.
  - `Banner` actual Figma implementation work completed:
    - Archived local `Banner` component set was promoted from `ARCHIVE / Feedback (Banner · Toast · Tooltip · EmptyState)` to the official `Banner` page.
    - Corrected against the official Banner page at `https://astryx.atmeta.com/components/Banner`.
    - `OFFICIAL_DOCS_SYNC / Banner` was created with all 11 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Banner` was created with complete official webpage examples:
      - `Banner — Collapsible`
      - `Banner — Dismiss`
      - `Banner — Full Width`
      - `Banner — Statuses`
      - `Banner — Action`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Dismiss behavior, collapsible expansion, endContent slot behavior, section/card container variants, and status icon binding need a future component-property/prototype pass.
  - `EmptyState` page now includes official `EmptyState` props from Astryx MCP `get`.
  - `EmptyState` actual Figma implementation work completed:
    - Archived local `EmptyState` component was promoted from `ARCHIVE / Feedback (Banner · Toast · Tooltip · EmptyState)` to the official `EmptyState` page.
    - Corrected against the official EmptyState page at `https://astryx.atmeta.com/components/EmptyState`.
    - `OFFICIAL_DOCS_SYNC / EmptyState` was created with all 7 official prop rows, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / EmptyState` was created with complete official webpage examples:
      - `EmptyState — Actions`
      - `EmptyState — Compact`
      - `EmptyState — Container`
    - Validation confirmed all required props and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Action layout, compact spacing, container/Card wrapping, heading level behavior, and decorative icon handling need a future component-property/prototype pass.
  - `Toast` page now includes official `Toast` props from Astryx MCP `get`.
  - `Toast` actual Figma implementation work completed:
    - Archived local `Toast` component set was promoted from `ARCHIVE / Feedback (Banner · Toast · Tooltip · EmptyState)` to the official `Toast` page.
    - Corrected against the official Toast page at `https://astryx.atmeta.com/components/Toast`.
    - `OFFICIAL_DOCS_SYNC / Toast` was created with all 8 official prop rows, including prop name, type/options, required/default, and official description.
    - Official group member `useToast` was recorded as a hook note, not invented as a Figma component.
    - `OFFICIAL_EXAMPLES / Toast` was created with complete official webpage examples:
      - `Toast — Action`
      - `Toast — Deduplication`
      - `Toast — Dismiss`
      - `Toast — Stacking`
      - `Toast — Types`
    - Validation confirmed all required props, hook note, and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. ToastViewport lifecycle, auto-dismiss timers, deduplication, stacking animations, programmatic dismiss, and hook behavior need a future prototype/documentation pass.
  - `Tooltip` page now includes official `Tooltip` props from Astryx MCP `get`.
  - `Tooltip` actual Figma implementation work completed:
    - Archived local `Tooltip` component was promoted from `ARCHIVE / Feedback (Banner · Toast · Tooltip · EmptyState)` to the official `Tooltip` page.
    - Corrected against the official Tooltip page at `https://astryx.atmeta.com/components/Tooltip`.
    - `OFFICIAL_DOCS_SYNC / Tooltip` was created with all 12 official prop rows, including prop name, type/options, required/default, and official description.
    - Official group member `useTooltip` was recorded as a hook note, not invented as a Figma component.
    - `OFFICIAL_EXAMPLES / Tooltip` was created with complete official webpage examples:
      - `Tooltip — Action Bar`
      - `Tooltip — Hook Usage`
      - `Tooltip — Inline Text`
    - Validation confirmed all required props, hook note, and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Hover/focus trigger behavior, placement/alignment logic, delayed open/close timing, programmatic hook control, and hover indication behavior need a future prototype/documentation pass.
  - `Table` page includes official `Table` props from Astryx MCP `get`.
  - `Table` actual Figma implementation work completed:
    - Corrected against the official Table page at `https://astryx.atmeta.com/components/Table`.
    - `OFFICIAL_EXAMPLES / Table` frame was created on the `Table` page.
    - Complete official examples implemented as table/composition examples:
      - `Table — Column Settings`
      - `Table — Popover Filters`
      - `Table — Grid Dividers`
      - `Table — In Card`
      - `Table — Inline Filters`
      - `Table — Paginated Data`
      - `Table — Resizable Columns`
      - `Table — Rich Cell Content`
      - `Table — Row Selection`
      - `Table — Sortable Columns`
      - `Table — Striped Rows`
    - Validation confirmed all official example headings exist and screenshot verification showed the examples render without obvious overlap.
    - Caveat: many Table examples are currently implemented as static table compositions because advanced behaviors such as column resizing, sorting, row selection, popover filters, and column visibility are not yet exposed as interactive Figma component properties.
  - `Typeahead` page includes official `Typeahead`, `BaseTypeahead`, and `TypeaheadItem` props from Astryx MCP `get`.
  - `Typeahead` actual Figma implementation work completed:
    - Archived local `Typeahead` component was promoted from `ARCHIVE / Advanced Selection (Typeahead · Tokenizer · MultiSelector · PowerSearch)` to the official `Typeahead` page.
    - Corrected against the official Typeahead page at `https://astryx.atmeta.com/components/Typeahead`.
    - `OFFICIAL_EXAMPLES / Typeahead` frame was created on the `Typeahead` page.
    - Complete official examples implemented as typeahead compositions:
      - `Typeahead — Limited Results`
      - `Typeahead — Search Field`
      - `Typeahead — With Helper Text`
      - `Typeahead — With Validation`
    - Validation confirmed all official example headings/labels exist.
    - Caveat: examples are static compositions. Search source behavior, filtering, disabled items, validation state, and helper text need a future component-property/prototype pass.
  - `Button` official webpage recheck found the current Button examples are incomplete:
    - Official webpage examples are:
      - `Button — Sizes`
      - `Button — Variants`
      - `Button — End Slot`
      - `Button — Icon`
    - Current Figma examples only include:
      - `Button — Variants`
      - `Button — End Slot`
    - Required action: update `OFFICIAL_EXAMPLES / Button` to add `Button — Sizes` and `Button — Icon` and keep the existing official examples.
  - `Button` official webpage correction completed:
    - Corrected against the official Button page at `https://astryx.atmeta.com/components/Button`.
    - `OFFICIAL_EXAMPLES / Button` was rebuilt in the official webpage order:
      - `Button — Sizes`
      - `Button — Variants`
      - `Button — End Slot`
      - `Button — Icon`
    - Validation confirmed all official example headings/labels exist and screenshot export completed.
    - Caveat: `Button — End Slot` still uses manual trailing badge compositions because the Figma `Button` component set does not yet expose `endContent` as a true component property. `Button — Icon` uses the existing icon-enabled Button property and should later be refined to match exact official icon choices if the icon assets are added.
  - `Checkbox` page now includes official `CheckboxInput`, `CheckboxList`, and `CheckboxListItem` props from Astryx MCP `get`.
  - `Checkbox` actual Figma implementation work completed:
    - Official `Checkbox` group was confirmed; `Checkbox` itself is not an exact public component name and `https://astryx.atmeta.com/components/Checkbox` returns 404.
    - Archived local `CheckboxInput`, `CheckboxList`, and `CheckboxListItem` components were promoted from archived grouped pages to the official `Checkbox` page.
    - Corrected against the official webpages:
      - `https://astryx.atmeta.com/components/CheckboxInput`
      - `https://astryx.atmeta.com/components/CheckboxList`
      - `https://astryx.atmeta.com/components/CheckboxListItem`
    - `OFFICIAL_DOCS_SYNC / Checkbox` was created with all 39 official prop rows across the three group members, including prop name, type/options, required/default, and official description.
    - `OFFICIAL_EXAMPLES / Checkbox` was created with complete official webpage examples:
      - `CheckboxInput — States`
      - `CheckboxInput — Indeterminate`
      - `CheckboxInput — Status`
      - `CheckboxList — Select All With Indeterminate`
      - `CheckboxList — With End Content`
      - `CheckboxListItem — Basic`
    - Validation confirmed all required group members, representative props, and official example headings exist; screenshot export completed.
    - Caveat: examples are static compositions. Controlled checked state, indeterminate behavior, async changeAction loading, endContent slot behavior, and validation interactions need a future component-property/prototype pass.
  - `TextArea` page includes official `TextArea` props from Astryx MCP `get`.
  - `TextArea` actual Figma implementation work completed:
    - Archived local `TextArea` component set was promoted from `ARCHIVE / Inputs (TextInput · TextArea)` to the official `TextArea` page.
    - `OFFICIAL_EXAMPLES / TextArea` frame was created on the `TextArea` page.
    - Initial implementation was incomplete because it used Astryx MCP `example/moreExamples` instead of checking the official website page directly.
    - Corrected against the official TextArea page at `https://astryx.atmeta.com/components/TextArea`.
    - Complete official examples implemented as real component instance compositions:
      - `TextArea — Character Count`
      - `TextArea — States`
      - `TextArea — Validation`
      - `TextArea — Icon`
    - Removed the non-official extra `TextArea` example from the examples frame.
    - Validation confirmed all official example headings/labels exist and screenshot verification showed the examples render without obvious overlap or clipping after widening the examples frame.
    - Caveat: the current Figma `TextArea` component set does not yet expose official `maxLength`, status variants, loading, or start-icon behavior as proper Figma component properties. These examples use instance compositions/manual helper text where needed and must later be corrected into true component-property implementations.
  - `TextInput` page includes official `TextInput` props from Astryx MCP `get`.
  - `TextInput` actual Figma implementation work completed:
    - Archived local `TextInput` component set was promoted from `ARCHIVE / Inputs (TextInput · TextArea)` to the official `TextInput` page.
    - `OFFICIAL_EXAMPLES / TextInput` frame was created on the `TextInput` page.
    - Initial implementation was incomplete because it used Astryx MCP `example/moreExamples` instead of checking the official website page directly.
    - Corrected against the official TextInput page at `https://astryx.atmeta.com/components/TextInput`.
    - Complete official examples implemented as real component instance compositions:
      - `TextInput — Icon`
      - `TextInput — Search`
      - `TextInput — Sizes`
      - `TextInput — States`
      - `TextInput — Types`
    - Removed the non-official extra `TextInput` example from the examples frame.
    - Validation confirmed all official example headings/labels exist and screenshot verification showed the examples render without obvious overlap.
    - Caveat: the current Figma `TextInput` component set does not yet expose official `startIcon`, clear button, hidden label, loading, success/warning status, tooltip, required, or optional behavior as proper Figma component properties. These examples use instance compositions/manual helper text where needed and must later be corrected into true component-property implementations.
- Generated in the session but not safely persistent:
  - None currently listed.
- Existing visual components on those pages were preserved; they still need reconciliation against official docs visuals/states.
- Verified sync frame count in Figma: 11 pages.

Required Figma write strategy from now on:

- Use one page-scoped `_use_figma` write per official docs page.
- Each page write must call `await figma.setCurrentPageAsync(page)` before mutating page children.
- After every page write, run a separate read-only verification for that page.
- Update this checkpoint immediately after each verified page.

Next Astryx MCP docs already fetched for preparation:

- `Dialog`
- `CommandPalette`
- `Layout`
- `Typeahead`
- `Table`
- `Text`
- `DateInput`
- `NumberInput`
- `TimeInput`
- `FileInput`

Additional Astryx MCP verification completed:

- `CommandPalette` official page grouping confirmed:
  - `CommandPalette`: 14 props
  - `CommandPaletteInput`: 6 props
  - `CommandPaletteList`: 3 props
  - `CommandPaletteItem`: 7 props
  - `CommandPaletteGroup`: 3 props
  - `CommandPaletteFooter`: 2 props
  - `CommandPaletteEmpty`: 1 prop
- `Layout` official page grouping confirmed:
  - `Layout`: 6 props
  - `LayoutHeader`: 5 props
  - `LayoutContent`: 4 props
  - `LayoutFooter`: 5 props
  - `LayoutPanel`: 5 props
- `Typeahead` official page grouping confirmed:
  - `Typeahead`: 23 props
  - `BaseTypeahead`: 18 props
  - `TypeaheadItem`: 5 props
- `Table` official page grouping confirmed:
  - `Table`: 12 props

These should be included in the next cumulative Figma write, together with all already synced pages, not as a standalone write.

Important write constraint:

- Do not write these next pages as a standalone Figma MCP batch.
- Figma MCP writes must include all previously synced pages plus new pages in one transaction, otherwise earlier `OFFICIAL_DOCS_SYNC` frames disappear.

## Removed From Earlier Checkpoint

The previous checkpoint contained wording that no longer matches the user's intent. Those ideas should not guide future work:

- "internalize" as a design decision
- "mark internal if kept" as a sufficient action
- "recommended additions" based on inferred UX needs
- treating current Figma prose as partially authoritative
- treating Figma component properties as official React props
- using helper components as independent public docs entries

The only goal is exact official Astryx docs mirroring.

## 2026-07-04 Remaining Work Audit

Source:

- Official list: `npx astryx component --list`
- Figma state: page-by-page Figma MCP scan for `OFFICIAL_DOCS_SYNC` and `OFFICIAL_EXAMPLES`
- Checkpoint progress records

Important scan note:

- A broad Figma scan can miss recently written frames unless each page is activated with `await figma.setCurrentPageAsync(page)`.
- Page-by-page activation confirmed that recently written pages such as `Banner`, `EmptyState`, `Toast`, `Tooltip`, `Slider`, `ProgressBar`, `CircularProgress`, and `Spinner` still retain their official docs/examples frames.

Verified page-level completed or substantially completed:

- `Badge`
- `Banner`
- `Button`
- `Checkbox`
- `Collapsible`
- `CommandPalette`
- `DateInput`
- `Dialog`
- `EmptyState`
- `Field`
- `FileInput`
- `Layout`
- `NumberInput`
- `Pagination`
- `ProgressBar`
- `Radio`
- `SegmentedControl`
- `Skeleton`
- `Slider`
- `Spinner`
- `Switch`
- `Table`
- `TextArea`
- `TextInput`
- `TimeInput`
- `Toast`
- `Tooltip`

Special completed state:

- `CircularProgress`
  - Official docs/properties are present.
  - The official webpage did not expose an `Examples` section, so no examples frame should be invented.

Needs correction even though work was previously done:

- `Typeahead`
  - `OFFICIAL_EXAMPLES / Typeahead` exists.
  - Current Figma scan did not find `OFFICIAL_DOCS_SYNC / Typeahead`.
  - Required action: restore/recreate official docs/properties frame for `Typeahead`, `BaseTypeahead`, and `TypeaheadItem`; keep the already verified official examples.
  - Completed after this audit:
    - `OFFICIAL_DOCS_SYNC / Typeahead` was restored with all 47 official prop rows:
      - `Typeahead`: 24 props
      - `BaseTypeahead`: 18 props
      - `TypeaheadItem`: 5 props
    - Existing `OFFICIAL_EXAMPLES / Typeahead` was preserved.
    - Validation confirmed docs, examples, required group members, representative props, and official example headings exist.

Pages with some docs but missing official webpage example implementation/revalidation:

- `Avatar`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `Avatar`, `AvatarGroup`, `AvatarGroupOverflow`, and `AvatarStatusDot`.
    - `OFFICIAL_DOCS_SYNC / Avatar` now has all 19 official prop rows.
    - `OFFICIAL_EXAMPLES / Avatar` now includes all official webpage examples:
      - `Avatar — Fallback Chain`
      - `Avatar — Initials`
      - `Avatar — User Card`
      - `Avatar — Photo`
      - `Avatar — Status Dot`
      - `Avatar — Group`
      - `AvatarGroupOverflow — Custom Text`
      - `AvatarGroupOverflow — Default Count`
      - `AvatarStatusDot — Variants`
    - Validation confirmed required group members, representative props, and official example headings exist.
- `Icon`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for the public `Icon` component only.
    - `OFFICIAL_DOCS_SYNC / Icon` now has all 3 official prop rows: `icon`, `color`, `size`.
    - `OFFICIAL_EXAMPLES / Icon` now includes all official webpage examples:
      - `Icon — Non-Semantic Colors`
      - `Icon — Semantic Colors`
      - `Icon — Size Variants`
      - `Icon — Status Indicators`
    - Added a public-surface note that individual glyph components are implementation assets and must not be documented as separate Astryx components.
    - Validation confirmed required props, public-surface note, and official example headings exist.
- `Card`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `Card`, `ClickableCard`, and `SelectableCard`.
    - `OFFICIAL_DOCS_SYNC / Card` now has all 30 official prop rows.
    - `OFFICIAL_EXAMPLES / Card` now includes all official webpage examples:
      - `Card — Callout`
      - `Card — Variants`
      - `Card — Layout`
      - `Card — Simple`
      - `ClickableCardWithNestedButton`
      - `SelectableCardMulti`
    - Validation confirmed required group members, representative props, and official example headings exist.
- `AspectRatio`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `AspectRatio`.
    - `OFFICIAL_DOCS_SYNC / AspectRatio` now has all 3 official prop rows.
    - `OFFICIAL_EXAMPLES / AspectRatio` now includes all official webpage examples:
      - `AspectRatio — Circle Image`
      - `AspectRatio — Image Gallery`
      - `AspectRatio — Square Image`
      - `AspectRatio — 16:9 Widescreen Image`
      - `AspectRatio — Loading Skeleton`
    - Validation confirmed required props and official example headings exist.
- `Breadcrumbs`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `Breadcrumbs` and `BreadcrumbItem`.
    - `OFFICIAL_DOCS_SYNC / Breadcrumbs` now has all 11 official prop rows.
    - `OFFICIAL_EXAMPLES / Breadcrumbs` now includes all official webpage examples:
      - `Breadcrumbs — Separators`
      - `Breadcrumbs — Deep Path`
      - `Breadcrumbs — Variants`
      - `Breadcrumbs — Icons`
      - `BreadcrumbItem — Basic`
    - Validation confirmed required group members, representative props, and official example headings exist.
- `DropdownMenu`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `DropdownMenu` and `DropdownMenuItem`.
    - `OFFICIAL_DOCS_SYNC / DropdownMenu` now has all 13 official prop rows.
    - `OFFICIAL_EXAMPLES / DropdownMenu` now includes all official webpage examples:
      - `DropdownMenu — Actions`
      - `DropdownMenu — Icon Trigger`
      - `DropdownMenu — Disabled`
      - `DropdownMenu — Sections`
      - `DropdownMenuItem — Basic`
    - Validation confirmed required group members, representative props, and official example headings exist.
- `Selector`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `Selector`, `MultiSelector`, and `SelectorOption`.
    - `OFFICIAL_DOCS_SYNC / Selector` now has all 45 official prop rows.
    - `OFFICIAL_EXAMPLES / Selector` now includes all official webpage examples:
      - `Selector — Clearable`
      - `Selector — Grouped Sections`
      - `Selector — Validation States`
      - `SelectorOption — Basic`
      - `MultiSelector — Column Visibility`
      - `MultiSelector — Form Composition`
      - `MultiSelector — Searchable`
      - `MultiSelector — Sectioned Permissions`
    - Validation confirmed required group members, representative props, and official example headings exist.
- `Utilities`
  - Completed after this audit:
    - Rebuilt from official Astryx MCP props for `Theme`, `MediaTheme`, and `LinkProvider`.
    - `OFFICIAL_DOCS_SYNC / Utilities` now has all 7 official prop rows.
    - `OFFICIAL_EXAMPLES / Utilities` now includes all official webpage examples:
      - `Theme — Apply Theme`
      - `Theme — Nested Theme`
      - `Theme — Switch Themes`
      - `MediaTheme — Image Overlay`
      - `MediaTheme — Light Scrim`
      - `Link Provider — Custom Link Component`
    - Added a surface note not to invent Figma components for extra hook/provider names that are not present in the official component list.
    - Validation confirmed required entries, representative props, public-surface note, and official example headings exist.

Pages with no official docs/examples work detected and still needing full official sync:

- `AppShell`
  - Completed after this audit:
    - Built from official Astryx MCP props for `AppShell`.
    - `OFFICIAL_DOCS_SYNC / AppShell` now has all 9 official prop rows.
    - Official group member `useAppShellMobile` was recorded as a hook note, not invented as a Figma component.
    - `OFFICIAL_EXAMPLES / AppShell` now includes all official webpage examples:
      - `AppShell — Content Only`
      - `AppShell — Side Nav Only`
      - `AppShell — Top Nav Only`
      - `AppShell — Top Nav with Side Nav`
      - `AppShell — With Banner`
    - Validation confirmed required props, hook note, and official example headings exist.
- `Blockquote`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Blockquote`.
    - `OFFICIAL_DOCS_SYNC / Blockquote` now has all 3 official prop rows:
      - `children`
      - `cite`
      - `xstyle`
    - `OFFICIAL_EXAMPLES / Blockquote` now includes all official webpage examples:
      - `Blockquote — Testimonials`
      - `Blockquote — With Attribution`
    - Validation confirmed required props and official example headings exist.
- `Calendar`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Calendar`.
    - `OFFICIAL_DOCS_SYNC / Calendar` now has all 15 official prop rows.
    - Added a public-surface note that `CalendarDay` is not an official component page in the Astryx docs and must not be documented as a separate public component.
    - `OFFICIAL_COMPONENTS / Calendar` now contains an actual `Calendar` component representation.
    - `OFFICIAL_EXAMPLES / Calendar` now includes all official webpage examples:
      - `Calendar — Constraints`
      - `Calendar — Range`
      - `Calendar — Single`
      - `Calendar — Two Months`
    - Validation confirmed required props, example headings, component section, and absence of public `CalendarDay` docs/example sections.
- `Carousel`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Carousel`.
    - `OFFICIAL_DOCS_SYNC / Carousel` now has all 12 official prop rows.
    - `OFFICIAL_COMPONENTS / Carousel` now contains an actual `Carousel` component representation.
    - `OFFICIAL_EXAMPLES / Carousel` now includes all official webpage examples:
      - `Carousel — Cards`
      - `Carousel — Snap`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Carousel — Cards`, while the official webpage also includes `Carousel — Snap`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `Chat`
  - Completed after this audit:
    - Official docs grouping confirmed: `Chat` is an official group page; it must not be split into arbitrary pages such as `Chat — Messages` or `Chat — Composer & Layout`.
    - Official `ChatComposerTokenElement` confirmed by Astryx MCP and official webpage navigation even though it was not visible in the earlier filtered CLI list; it is included in the Chat group work.
  - Completed Composer chunk:
    - Built from official Astryx MCP props for `ChatComposer`, `ChatComposerDrawer`, and `ChatComposerInput`.
    - `OFFICIAL_DOCS_SYNC / Chat / Composer Chunk` now has all 36 official prop rows for these three components.
    - `OFFICIAL_COMPONENTS / Chat / Composer Chunk` now contains actual component representations for:
      - `ChatComposer`
      - `ChatComposerDrawer`
      - `ChatComposerInput`
    - `OFFICIAL_EXAMPLES / Chat / Composer Chunk` now includes all official webpage examples for these three components:
      - `ChatComposer — Attachments`
      - `ChatComposer — Footer Actions`
      - `ChatComposer — Full Featured`
      - `ChatComposer — Simple`
      - `ChatComposer — Streaming`
      - `ChatComposer — Validation`
      - `ChatComposerDrawer — Attachments`
      - `ChatComposerDrawer — Collapsible`
      - `ChatComposerDrawer — Feedback`
      - `ChatComposerDrawer — With Progress`
      - `ChatComposerInput — Controlled`
      - `ChatComposerInput — Disabled`
      - `ChatComposerInput — Mentions`
      - `ChatComposerInput — Multiple Triggers`
      - `ChatComposerInput — Slash Commands`
    - Validation confirmed required props, component section, and official example headings exist.
  - Completed Layout Controls chunk:
    - Built from official Astryx MCP props for `ChatComposerTokenElement`, `ChatDictationButton`, `ChatLayout`, and `ChatLayoutScrollButton`.
    - `OFFICIAL_DOCS_SYNC / Chat / Layout Controls Chunk` now has all 14 official prop rows for these four components.
    - `OFFICIAL_COMPONENTS / Chat / Layout Controls Chunk` now contains actual component representations for:
      - `ChatComposerTokenElement`
      - `ChatDictationButton`
      - `ChatLayout`
      - `ChatLayoutScrollButton`
    - Official webpage examples were checked directly:
      - `ChatComposerTokenElement` has no official webpage Examples section, so no example was invented.
      - `ChatDictationButton — Basic`
      - `ChatLayout — Panel View`
      - `ChatLayoutScrollButton — Labels`
    - Validation confirmed required props, component section, no invented `ChatComposerTokenElement` example, and official example headings exist.
  - Completed Message chunk:
    - Built from official Astryx MCP props for `ChatMessage`, `ChatMessageBubble`, `ChatMessageList`, and `ChatMessageMetadata`.
    - `OFFICIAL_DOCS_SYNC / Chat / Message Chunk` now has all 20 official prop rows for these four components.
    - `OFFICIAL_COMPONENTS / Chat / Message Chunk` now contains actual component representations for:
      - `ChatMessage`
      - `ChatMessageBubble`
      - `ChatMessageList`
      - `ChatMessageMetadata`
    - `OFFICIAL_EXAMPLES / Chat / Message Chunk` now includes all official webpage examples for these four components:
      - `ChatMessage — Avatar & Name`
      - `ChatMessage — Ghost`
      - `ChatMessage — Multi-Bubble`
      - `ChatMessageBubble — Density`
      - `ChatMessageBubble — Grouping`
      - `ChatMessageBubble — Metadata`
      - `ChatMessageBubble — Variants`
      - `ChatMessageList — Density`
      - `ChatMessageList — Full Featured`
      - `ChatMessageMetadata — Footer Actions`
      - `ChatMessageMetadata — Status`
      - `ChatMessageMetadata — Timestamps`
    - Validation confirmed required props, component section, and official example headings exist.
  - Completed Actions/System/Tools chunk:
    - Built from official Astryx MCP props for `ChatSendButton`, `ChatSystemMessage`, `ChatTokenizedText`, and `ChatToolCalls`.
    - `OFFICIAL_DOCS_SYNC / Chat / Actions System Tools Chunk` now has all 19 official prop rows for these four components.
    - `OFFICIAL_COMPONENTS / Chat / Actions System Tools Chunk` now contains actual component representations for:
      - `ChatSendButton`
      - `ChatSystemMessage`
      - `ChatTokenizedText`
      - `ChatToolCalls`
    - `OFFICIAL_EXAMPLES / Chat / Actions System Tools Chunk` now includes all official webpage examples for these four components:
      - `ChatSendButton — Custom Icon`
      - `ChatSendButton — In Composer`
      - `ChatSendButton — States`
      - `ChatSystemMessage — Status Updates`
      - `ChatSystemMessage — Variants`
      - `ChatSystemMessage — Icon`
      - `ChatTokenizedText — Basic`
      - `ChatTokenizedText — Colors`
      - `ChatToolCalls — Expandable`
      - `ChatToolCalls — Statuses`
      - `ChatToolCalls — Simple`
    - Validation confirmed required props, component section, and official example headings exist.
  - Chat group completion validation:
    - Official Chat group now includes 15 component representations.
    - Total verified Chat prop rows: 89.
    - Total verified Chat official webpage example cards: 41.
    - All required component names and official webpage example headings were found.
    - Recorded MCP-vs-web discrepancy: many Chat component MCP results listed only one `moreExamples` entry, while official webpages exposed additional examples; the Figma page follows the official webpages.
- `Citation`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Citation`.
    - `OFFICIAL_DOCS_SYNC / Citation` now has all 3 official prop rows.
    - `OFFICIAL_COMPONENTS / Citation` now contains an actual `Citation` component representation.
    - `OFFICIAL_EXAMPLES / Citation` now includes all official webpage examples:
      - `Citation — Inline Text`
      - `Citation — Source List`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Citation — Inline Text`, while the official webpage also includes `Citation — Source List`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `CodeBlock`
  - Completed after this audit:
    - Built from official Astryx MCP props for `CodeBlock`.
    - `OFFICIAL_DOCS_SYNC / CodeBlock` now has all 20 official prop rows.
    - `OFFICIAL_COMPONENTS / CodeBlock` now contains an actual `CodeBlock` component representation.
    - `OFFICIAL_EXAMPLES / CodeBlock` now includes all official webpage examples:
      - `Code — Snippet`
      - `Code — Highlighted`
      - `Code — Config`
      - `Code — Scrollable`
    - Validation confirmed required props, component section, and official example headings exist.
  - Additional official page discovered and completed:
    - Official docs expose `Code` as a separate component page, not only `CodeBlock`.
    - Created/rebuilt the separate `Code` Figma page.
    - `OFFICIAL_DOCS_SYNC / Code` now has all 5 official prop rows.
    - `OFFICIAL_COMPONENTS / Code` now contains an actual `Code` component representation.
    - `OFFICIAL_EXAMPLES / Code` now includes all official webpage examples:
      - `Code — Text Sizes`
      - `Code — Inline`
      - `Code — Content Types`
    - Validation confirmed required props, component section, and official example headings exist.
- `ContextMenu`
  - Completed after this audit:
    - Built from official Astryx MCP props for `ContextMenu` and `ContextMenuItem`.
    - `OFFICIAL_DOCS_SYNC / ContextMenu` now has all 12 official prop rows.
    - `OFFICIAL_COMPONENTS / ContextMenu` now contains actual component representations for:
      - `ContextMenu`
      - `ContextMenuItem`
    - Official webpage examples were checked directly:
      - `ContextMenu — Basic`
      - `ContextMenuItem` has no official webpage Examples section, so no separate example was invented.
    - `OFFICIAL_EXAMPLES / ContextMenu` now includes the official `ContextMenu — Basic` example.
    - Validation confirmed required props, component section, no invented `ContextMenuItem` example, and official example heading exists.
- `Divider`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Divider`.
    - `OFFICIAL_DOCS_SYNC / Divider` now has all 5 official prop rows.
    - `OFFICIAL_COMPONENTS / Divider` now contains an actual `Divider` component representation.
    - `OFFICIAL_EXAMPLES / Divider` now includes all official webpage examples:
      - `Divider — Full Bleed`
      - `Divider — Variants`
      - `Divider — Vertical`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Divider — Full Bleed`, while the official webpage also includes `Divider — Variants` and `Divider — Vertical`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `HoverCard`
  - Completed after this audit:
    - Built from official Astryx MCP props for `HoverCard`.
    - `OFFICIAL_DOCS_SYNC / HoverCard` now has all 11 official prop rows.
    - Added a group-member note that `useHoverCard` is an official hook and must not be created as a Figma component.
    - `OFFICIAL_COMPONENTS / HoverCard` now contains an actual `HoverCard` component representation.
    - `OFFICIAL_EXAMPLES / HoverCard` now includes all official webpage examples:
      - `HoverCard — Definition`
      - `HoverCard — Link Preview`
      - `HoverCard — Profile Preview`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `HoverCard — Definition`, while the official webpage also includes `HoverCard — Link Preview` and `HoverCard — Profile Preview`; the Figma page follows the official webpage.
    - Validation confirmed required props, hook note, component section, and official example headings exist.
- `Item`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Item`.
    - `OFFICIAL_DOCS_SYNC / Item` now has all 20 official prop rows.
    - Added a public-surface note that `ListItem` belongs to the official `List` group and must be handled on the `List` page, not merged into `Item`.
    - `OFFICIAL_COMPONENTS / Item` now contains an actual `Item` component representation.
    - `OFFICIAL_EXAMPLES / Item` now includes all official webpage examples:
      - `Item — Basic`
      - `Item — Start Content`
      - `Item — Metadata`
    - Validation confirmed required props, component section, official example headings, and absence of public `ListItem` docs/example sections on the `Item` page.
- `Kbd`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Kbd`.
    - `OFFICIAL_DOCS_SYNC / Kbd` now has all 4 official prop rows.
    - `OFFICIAL_COMPONENTS / Kbd` now contains an actual `Kbd` component representation.
    - `OFFICIAL_EXAMPLES / Kbd` now includes all official webpage examples:
      - `Kbd — Inline Instructions`
      - `Kbd — Menu Shortcuts`
      - `Kbd — Modifier Combinations`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Kbd — Inline Instructions`, while the official webpage also includes `Kbd — Menu Shortcuts` and `Kbd — Modifier Combinations`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `Lightbox`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Lightbox`.
    - `OFFICIAL_DOCS_SYNC / Lightbox` now has all 7 official prop rows.
    - `OFFICIAL_COMPONENTS / Lightbox` now contains an actual `Lightbox` component representation.
    - `OFFICIAL_EXAMPLES / Lightbox` now includes all official webpage examples:
      - `Lightbox — Gallery`
      - `Lightbox — Video`
      - `Lightbox — Zoom`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Lightbox — Gallery`, while the official webpage also includes `Lightbox — Video` and `Lightbox — Zoom`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `Link`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Link`.
    - `OFFICIAL_DOCS_SYNC / Link` now has all 13 official prop rows.
    - `OFFICIAL_COMPONENTS / Link` now contains an actual `Link` component representation.
    - `OFFICIAL_EXAMPLES / Link` now includes all official webpage examples:
      - `Link — External Links`
      - `Link — Inline Text`
      - `Link — With Tooltips`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Link — External Links`, while the official webpage also includes `Link — Inline Text` and `Link — With Tooltips`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `List`
  - Completed after this audit:
    - Built from official Astryx MCP props for `List` and `ListItem`.
    - `OFFICIAL_DOCS_SYNC / List` now has all 17 official prop rows for the official List group.
    - `OFFICIAL_COMPONENTS / List` now contains actual component representations for:
      - `List`
      - `ListItem`
    - `OFFICIAL_EXAMPLES / List` now includes all official webpage examples:
      - `List — Basic`
      - `List — Bulleted Features`
      - `List — Message List`
      - `List — Ordered Steps`
      - `List Item — Basic`
      - `List Item — Media`
      - `List Item — Metadata`
    - This completes the `ListItem` work that was intentionally not merged into the `Item` page.
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `List — Basic` / `ListItem` basic coverage, while official webpages expose additional List and List Item examples; the Figma page follows the official webpages.
    - Validation confirmed required props, component section, and official example headings exist.
- `Markdown`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Markdown`.
    - `OFFICIAL_DOCS_SYNC / Markdown` now has all 16 official prop rows.
    - `OFFICIAL_COMPONENTS / Markdown` now contains an actual `Markdown` component representation.
    - `OFFICIAL_EXAMPLES / Markdown` now includes all official webpage examples:
      - `Markdown — Cited Content`
      - `Markdown — Compact AI Response`
      - `Markdown — Data Table`
      - `Markdown — Rich Content`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `Markdown — Cited Content`, while the official webpage also includes `Markdown — Compact AI Response`, `Markdown — Data Table`, and `Markdown — Rich Content`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `MetadataList`
  - Completed after this audit:
    - Built from official Astryx MCP props for `MetadataList` and `MetadataListItem`.
    - `OFFICIAL_DOCS_SYNC / MetadataList` now has all 10 official prop rows for the official MetadataList group.
    - `OFFICIAL_COMPONENTS / MetadataList` now contains actual component representations for:
      - `MetadataList`
      - `MetadataListItem`
    - `OFFICIAL_EXAMPLES / MetadataList` now includes all official webpage examples:
      - `MetadataList — Basic`
      - `MetadataList — Collapsible`
      - `MetadataList — Horizontal`
      - `MetadataList — Multi-Column`
      - `MetadataListItem — Basic`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `MetadataList — Basic` coverage, while official webpages expose additional MetadataList examples and `MetadataListItem — Basic`; the Figma page follows the official webpages.
    - Validation confirmed required props, component section, and official example headings exist.
- `MoreMenu`
  - Completed after this audit:
    - Built from official Astryx MCP props for `MoreMenu`.
    - `OFFICIAL_DOCS_SYNC / MoreMenu` now has all 7 official prop rows.
    - `OFFICIAL_COMPONENTS / MoreMenu` now contains an actual `MoreMenu` component representation.
    - `OFFICIAL_EXAMPLES / MoreMenu` now includes all official webpage examples:
      - `MoreMenu — Default`
      - `MoreMenu — With Dividers`
      - `MoreMenu — With Sections`
    - Recorded MCP-vs-web discrepancy: Astryx MCP listed only `MoreMenu — Default`, while the official webpage also includes `MoreMenu — With Dividers` and `MoreMenu — With Sections`; the Figma page follows the official webpage.
    - Validation confirmed required props, component section, and official example headings exist.
- `Navigation`
  - Completed after this audit:
    - `Navigation` is an official group, not a standalone `/components/Navigation` component page.
    - Official group members confirmed so far include `MobileNav`, `MobileNavToggle`, `NavIcon`, `NavHeadingMenu`, `SideNav`, `SideNavCollapseButton`, `SideNavHeading`, `SideNavItem`, `SideNavSection`, `TopNav`, `TopNavHeading`, `TopNavItem`, `TopNavMegaMenu`, `TopNavMegaMenuFeaturedCard`, `TopNavMegaMenuItem`, and `TopNavMenu`.
  - Completed Mobile/Shared chunk:
    - Built from official Astryx MCP props for `MobileNav`, `MobileNavToggle`, `NavIcon`, and `NavHeadingMenu`.
    - `OFFICIAL_DOCS_SYNC / Navigation / Mobile Shared Chunk` now has all 13 official prop rows for these four components.
    - `OFFICIAL_COMPONENTS / Navigation / Mobile Shared Chunk` now contains actual component representations for:
      - `MobileNav`
      - `MobileNavToggle`
      - `NavIcon`
      - `NavHeadingMenu`
    - Correction: the first webpage extraction missed official showcase metadata embedded in the page payload.
    - `OFFICIAL_EXAMPLES / Navigation / Mobile Shared Chunk` now includes official showcase examples:
      - `Mobile Nav`
      - `Mobile Nav Toggle`
      - `Nav Icon`
    - `NavHeadingMenu` has no official showcase example, so no example was invented for that entry.
    - Validation confirmed required props, component section, 3 official showcase example cards, and the `NavHeadingMenu` no-showcase note.
  - Completed SideNav chunk:
    - Built from official Astryx MCP props for `SideNav`, `SideNavCollapseButton`, `SideNavHeading`, `SideNavItem`, and `SideNavSection`.
    - `OFFICIAL_DOCS_SYNC / Navigation / SideNav Chunk` now has all 37 official prop rows for these five components.
    - `OFFICIAL_COMPONENTS / Navigation / SideNav Chunk` now contains actual component representations for:
      - `SideNav`
      - `SideNavCollapseButton`
      - `SideNavHeading`
      - `SideNavItem`
      - `SideNavSection`
    - Correction: the first webpage extraction missed official showcase metadata embedded in the page payload.
    - `OFFICIAL_EXAMPLES / Navigation / SideNav Chunk` now includes official showcase examples:
      - `Side Nav`
      - `Side Nav Collapse Button`
      - `Side Nav Heading`
      - `Side Nav Item`
      - `Side Nav Section`
    - Validation confirmed required props, component section, and 5 official showcase example cards.
  - Completed TopNav chunk:
    - Built from official Astryx MCP props for `TopNav`, `TopNavHeading`, `TopNavItem`, `TopNavMegaMenu`, `TopNavMegaMenuFeaturedCard`, `TopNavMegaMenuItem`, and `TopNavMenu`.
    - `OFFICIAL_DOCS_SYNC / Navigation / TopNav Chunk` now has all 50 official prop rows for these seven components.
    - `OFFICIAL_COMPONENTS / Navigation / TopNav Chunk` now contains actual component representations for:
      - `TopNav`
      - `TopNavHeading`
      - `TopNavItem`
      - `TopNavMegaMenu`
      - `TopNavMegaMenuFeaturedCard`
      - `TopNavMegaMenuItem`
      - `TopNavMenu`
    - Correction: the first webpage extraction missed official showcase metadata embedded in the page payload.
    - `OFFICIAL_EXAMPLES / Navigation / TopNav Chunk` now includes official showcase examples:
      - `Top Nav`
      - `Top Nav Heading`
      - `Top Nav Item`
      - `Top Nav Mega Menu`
      - `Top Nav Mega Menu Featured Card`
      - `Top Nav Mega Menu Item`
      - `Top Nav Menu`
    - Validation confirmed required props, component section, and 7 official showcase example cards.
  - Navigation group completion validation:
    - Official Navigation group now includes 16 component representations.
    - Total verified Navigation prop rows: 100.
    - Total verified official showcase example cards: 15.
    - All required component names and representative props were found.
    - Recorded extraction correction: for Navigation pages, official examples are exposed as `showcase` metadata in the page payload rather than through the simple text `Examples` extraction used earlier.
- `Outline`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Outline`.
    - `OFFICIAL_DOCS_SYNC / Outline` now has all 6 official prop rows.
    - `OFFICIAL_COMPONENTS / Outline` now contains an actual `Outline` component representation.
    - `OFFICIAL_EXAMPLES / Outline` now includes the official showcase metadata example:
      - `Outline`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Outline`; the showcase entry was treated as the official example.
    - Validation confirmed required props, component section, showcase source note, and official showcase example title exist.
- `OverflowList`
  - Completed after this audit:
    - Built from official Astryx MCP props for `OverflowList`.
    - `OFFICIAL_DOCS_SYNC / OverflowList` now has all 7 official prop rows.
    - `OFFICIAL_COMPONENTS / OverflowList` now contains an actual `OverflowList` component representation.
    - `OFFICIAL_EXAMPLES / OverflowList` now includes the official showcase metadata example:
      - `Overflow List`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = OverflowList`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `OverflowList — Badge Tags`, while the official page showcase displayName is `Overflow List`; the Figma page follows the official page showcase metadata.
    - Validation confirmed required props, component section, showcase source note, and official showcase example title exist.
- `Overlay`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Overlay`.
    - `OFFICIAL_DOCS_SYNC / Overlay` now has all 11 official prop rows.
    - `OFFICIAL_COMPONENTS / Overlay` now contains an actual `Overlay` component representation.
    - `OFFICIAL_EXAMPLES / Overlay` now includes the official showcase metadata example:
      - `Overlay`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Overlay`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Overlay — Bottom Strip`, while the official page showcase displayName is `Overlay`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 11 prop rows, component section, showcase source note, and official showcase example title exist.
- `Popover`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Popover`.
    - `OFFICIAL_DOCS_SYNC / Popover` now has all 16 official prop rows.
    - `OFFICIAL_COMPONENTS / Popover` now contains an actual `Popover` component representation.
    - `OFFICIAL_EXAMPLES / Popover` now includes the official showcase metadata example:
      - `Popover`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Popover`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Popover — Confirm Action`, while the official page showcase displayName is `Popover`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 16 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `PowerSearch`
  - Completed after this audit:
    - Built from official Astryx MCP props for `PowerSearch`.
    - `OFFICIAL_DOCS_SYNC / PowerSearch` now has all 20 official prop rows.
    - `OFFICIAL_COMPONENTS / PowerSearch` now contains an actual `PowerSearch` component representation.
    - `OFFICIAL_EXAMPLES / PowerSearch` now includes the official showcase metadata example:
      - `Power Search`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = PowerSearch`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `PowerSearch — Content Search`, while the official page showcase displayName is `Power Search`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 20 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `StatusDot`
  - Completed after this audit:
    - Built from official Astryx MCP props for `StatusDot`.
    - `OFFICIAL_DOCS_SYNC / StatusDot` now has all 5 official prop rows.
    - `OFFICIAL_COMPONENTS / StatusDot` now contains an actual `StatusDot` component representation.
    - `OFFICIAL_EXAMPLES / StatusDot` now includes the official showcase metadata example:
      - `Status Dot`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = StatusDot`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `StatusDot — Pulsing`, while the official page showcase displayName is `Status Dot`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 5 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `Tabs`
  - Completed after this audit:
    - Confirmed `Tabs` itself is not a public component endpoint: `https://astryx.atmeta.com/components/Tabs` returned 404 and Astryx MCP `get("Tabs")` returned suggestions rather than component props.
    - Built the official `Tabs` group page from the actual public entries returned by Astryx MCP search:
      - `TabList`
      - `Tab`
      - `TabMenu`
    - `OFFICIAL_DOCS_SYNC / Tabs` now has all official prop rows for the group members:
      - `TabList`: 8 prop rows
      - `Tab`: 9 prop rows
      - `TabMenu`: 2 prop rows
      - Total: 19 prop rows
    - `OFFICIAL_COMPONENTS / Tabs` now contains actual component representations for `TabList`, `Tab`, and `TabMenu`.
    - `OFFICIAL_EXAMPLES / Tabs` now includes the official showcase metadata examples from each member page:
      - `Tab List`
      - `Tab`
      - `Tab Menu`
    - Recorded extraction note: each member page had no visible `Examples` heading in text extraction, but raw page payload exposed `showcase.exampleFor` for `TabList`, `Tab`, and `TabMenu`.
    - Recorded MCP-vs-web/showcase discrepancy:
      - `TabList` MCP listed `TabList — Fill Layout`, while official page showcase displayName is `Tab List`.
      - `Tab` MCP listed `Tab — Selected Icon`, while official page showcase displayName is `Tab`.
      - `TabMenu` MCP moreExamples mirrored `TabList — Fill Layout`, while official page showcase displayName is `Tab Menu`.
    - Validation confirmed all 19 prop rows, 3 component representations, 3 official showcase example cards, source notes, and discrepancy notes exist.
- `Text`
  - Completed after this audit:
    - Built the official `Text` group page from official public entries:
      - `Text`
      - `Heading`
    - `OFFICIAL_DOCS_SYNC / Text` now has all official prop rows for the group members:
      - `Text`: 17 prop rows
      - `Heading`: 14 prop rows
      - Total: 31 prop rows
    - `OFFICIAL_COMPONENTS / Text` now contains actual component representations for `Text` and `Heading`.
    - `OFFICIAL_EXAMPLES / Text` now includes the official showcase metadata examples from each member page:
      - `Text`
      - `Heading`
    - Recorded extraction note: member pages had no visible `Examples` heading in text extraction, but raw page payload exposed `showcase.exampleFor` for `Text` and `Heading`.
    - Recorded MCP-vs-web/showcase discrepancy:
      - `Text` MCP listed `Text — Colors`, while official page showcase displayName is `Text`.
      - `Heading` MCP listed `Heading — Card Grid`, while official page showcase displayName is `Heading`.
    - Validation confirmed all 31 prop rows, 2 component representations, 2 official showcase example cards, source notes, and discrepancy notes exist.
- `Thumbnail`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Thumbnail`.
    - `OFFICIAL_DOCS_SYNC / Thumbnail` now has all 11 official prop rows.
    - `OFFICIAL_COMPONENTS / Thumbnail` now contains an actual `Thumbnail` component representation.
    - `OFFICIAL_EXAMPLES / Thumbnail` now includes the official showcase metadata example:
      - `Thumbnail`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Thumbnail`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Thumbnail — Disabled`, while the official page showcase displayName is `Thumbnail`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 11 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `Timestamp`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Timestamp`.
    - `OFFICIAL_DOCS_SYNC / Timestamp` now has all 10 official prop rows.
    - `OFFICIAL_COMPONENTS / Timestamp` now contains an actual `Timestamp` component representation.
    - `OFFICIAL_EXAMPLES / Timestamp` now includes the official showcase metadata example:
      - `Timestamp`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Timestamp`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Timestamp — Auto`, while the official page showcase displayName is `Timestamp`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 10 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `Token`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Token`.
    - `OFFICIAL_DOCS_SYNC / Token` now has all 12 official prop rows.
    - `OFFICIAL_COMPONENTS / Token` now contains an actual `Token` component representation.
    - `OFFICIAL_EXAMPLES / Token` now includes the official showcase metadata example:
      - `Token`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Token`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Token — Clickable`, while the official page showcase displayName is `Token`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 12 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `Tokenizer`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Tokenizer`.
    - `OFFICIAL_DOCS_SYNC / Tokenizer` now has all 28 official prop rows.
    - `OFFICIAL_COMPONENTS / Tokenizer` now contains an actual `Tokenizer` component representation.
    - `OFFICIAL_EXAMPLES / Tokenizer` now includes the official showcase metadata example:
      - `Tokenizer`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Tokenizer`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Tokenizer — Clear`, while the official page showcase displayName is `Tokenizer`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 28 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.
- `Toolbar`
  - Completed after this audit:
    - Built from official Astryx MCP props for `Toolbar`.
    - `OFFICIAL_DOCS_SYNC / Toolbar` now has all 9 official prop rows.
    - `OFFICIAL_COMPONENTS / Toolbar` now contains an actual `Toolbar` component representation.
    - `OFFICIAL_EXAMPLES / Toolbar` now includes the official showcase metadata example:
      - `Toolbar — Three Slot`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = Toolbar`.
    - Recorded MCP-vs-web/showcase note: Astryx MCP example and official page showcase both expose `Toolbar — Three Slot`; MCP moreExamples additionally lists `Toolbar — Bulk Actions`, but the required Figma example follows the official page showcase metadata.
    - Validation confirmed all 9 prop rows, component section, showcase source note, official showcase example title, and MCP moreExamples note exist.
- `TreeList`
  - Completed after this audit:
    - Built from official Astryx MCP props for `TreeList`.
    - `OFFICIAL_DOCS_SYNC / TreeList` now has all 4 official prop rows.
    - `OFFICIAL_COMPONENTS / TreeList` now contains an actual `TreeList` component representation.
    - `OFFICIAL_EXAMPLES / TreeList` now includes the official showcase metadata example:
      - `Tree List`
    - Recorded extraction note: visible `Examples` text extraction returned no examples, but raw page payload exposed `showcase.exampleFor = TreeList`.
    - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `TreeList — File Tree With Icons`, while the official page showcase displayName is `Tree List`; the Figma page follows the official page showcase metadata.
    - Validation confirmed all 4 prop rows, component section, showcase source note, official showcase example title, and discrepancy note exist.

Known public-surface cleanup still needed:

- `Icon` page currently contains individual glyph components, but official public docs target is `Icon`.
- `Calendar` page contains `CalendarDay`; official public docs target must be verified before exposing `CalendarDay`.
- `Button` page still lacks true `ToggleButtonGroup` component modeling even though docs/examples have been corrected.
- `DialogHeader`, `CommandPaletteList`, `CollapsibleGroup`, layout compound components, and Typeahead subcomponents still need true first-class component/property modeling where the official docs expose them.

Known public-surface cleanup completed after continued work:

- `Typeahead`
  - Rebuilt the page as the official group containing:
    - `Typeahead`
    - `BaseTypeahead`
    - `TypeaheadItem`
  - `OFFICIAL_DOCS_SYNC / Typeahead` now has all official prop rows:
    - `Typeahead`: 24 prop rows
    - `BaseTypeahead`: 18 prop rows
    - `TypeaheadItem`: 5 prop rows
    - Total: 47 prop rows
  - `OFFICIAL_COMPONENTS / Typeahead` now contains actual component representations for all three official entries.
  - `OFFICIAL_EXAMPLES / Typeahead` now includes official showcase metadata examples:
    - `Typeahead`
    - `Typeahead Item`
  - `BaseTypeahead` has no component-specific official showcase metadata after MCP, visible webpage, and raw page payload checks; no example was invented.
  - Recorded MCP-vs-web/showcase note: MCP moreExamples for the group mirror `Typeahead — Limited Results`, while official page showcase metadata exposes `Typeahead` and `Typeahead Item`.
  - Validation confirmed all 47 prop rows, 3 component representations, 2 official showcase example cards, 1 no-example note, source notes, and discrepancy notes exist.
- `Icon`
  - Rebuilt the page from official Astryx MCP props for the public `Icon` component only.
  - `OFFICIAL_DOCS_SYNC / Icon` now has all 3 official prop rows:
    - `icon`
    - `color`
    - `size`
  - `OFFICIAL_COMPONENTS / Icon` now contains only the public `Icon` component representation.
  - Individual glyph names are documented only as valid `icon` prop values, not as separate public component docs/components.
  - `OFFICIAL_EXAMPLES / Icon` now includes the official showcase metadata example:
    - `Icon`
  - Recorded MCP-vs-web/showcase discrepancy: Astryx MCP listed `Icon — Non-Semantic Colors`, while the official page showcase displayName is `Icon`; the Figma page follows the official page showcase metadata.
  - Validation confirmed all 3 prop rows, 1 component representation, 1 official showcase example card, source notes, discrepancy note, and no glyph-style component names under the official component section.
- `Button` / `ToggleButtonGroup`
  - Added a targeted official cleanup section to the `Button` page for the missing public `ToggleButtonGroup` entry.
  - `OFFICIAL_DOCS_SYNC / Button / ToggleButtonGroup` now has all 10 official `ToggleButtonGroup` prop rows:
    - `children`
    - `label`
    - `type`
    - `value`
    - `onChange`
    - `orientation`
    - `size`
    - `isDisabled`
    - `xstyle`
    - `data-testid`
  - `OFFICIAL_COMPONENTS / Button / ToggleButtonGroup` now contains an actual `ToggleButtonGroup` component representation.
  - `OFFICIAL_EXAMPLES / Button / ToggleButtonGroup` now includes the official showcase metadata example:
    - `Toggle Button Group`
  - Recorded cleanup note: the `Button` page previously lacked true `ToggleButtonGroup` component modeling even though `ToggleButtonGroup` is an official public group member.
  - Validation confirmed all 10 prop rows, component section, official showcase example card, source notes, and cleanup note exist.
- `Calendar`
  - Verified `CalendarDay` is not an official public component:
    - Astryx MCP `get("CalendarDay")` returned suggestions rather than component props.
    - `https://astryx.atmeta.com/components/CalendarDay` returned 404.
  - Archived the root `CalendarDay` component set as `ARCHIVE / CalendarDay / non-public implementation detail` so it is not exposed as public docs surface.
  - Preserved the official `Calendar` page content:
    - `OFFICIAL_DOCS_SYNC / Calendar` still has all 15 official `Calendar` prop rows.
    - `OFFICIAL_COMPONENTS / Calendar` exposes only the official `Calendar` component.
    - `OFFICIAL_EXAMPLES / Calendar` remains present.
  - Added/confirmed the official cleanup note explaining that `CalendarDay` must not be documented or exposed as a separate public component.
  - Validation confirmed all 15 Calendar prop rows, official component section, official examples section, archived CalendarDay state, and no public `CalendarDay` component name.
- `Dialog` / `DialogHeader`
  - Added a targeted official cleanup section to the `Dialog` page for the missing public `DialogHeader` entry.
  - `OFFICIAL_DOCS_SYNC / Dialog / DialogHeader` now has all 6 official `DialogHeader` prop rows:
    - `title`
    - `subtitle`
    - `onOpenChange`
    - `startContent`
    - `endContent`
    - `hasDivider`
  - `OFFICIAL_COMPONENTS / Dialog / DialogHeader` now contains an actual `DialogHeader` component representation.
  - `OFFICIAL_EXAMPLES / Dialog / DialogHeader` now includes the official showcase metadata example:
    - `Dialog Header`
  - Recorded cleanup note: `DialogHeader` is an official public `Dialog` group member and must be represented with its own props, component, and official showcase example.
  - Validation confirmed all 6 prop rows, component section, official showcase example card, source notes, and cleanup note exist.
- `CommandPalette` / `CommandPaletteList`
  - Added a targeted official cleanup section to the `CommandPalette` page for the missing public `CommandPaletteList` entry.
  - `OFFICIAL_DOCS_SYNC / CommandPalette / CommandPaletteList` now has all 3 official `CommandPaletteList` prop rows:
    - `children`
    - `label`
    - `xstyle`
  - `OFFICIAL_COMPONENTS / CommandPalette / CommandPaletteList` now contains an actual `CommandPaletteList` component representation.
  - `OFFICIAL_EXAMPLES / CommandPalette / CommandPaletteList` contains a no-example note rather than an invented example.
  - Recorded extraction note: MCP, visible webpage examples, and raw page payload were checked; no `CommandPaletteList`-specific official showcase metadata or visible Examples section was found.
  - Validation confirmed all 3 prop rows, component section, 0 example cards, 1 no-example note, source notes, and no invented example.
- `Collapsible` / `CollapsibleGroup`
  - Added a targeted official cleanup section to the `Collapsible` page for the missing public `CollapsibleGroup` entry.
  - `OFFICIAL_DOCS_SYNC / Collapsible / CollapsibleGroup` now has all 5 official `CollapsibleGroup` prop rows:
    - `type`
    - `defaultValue`
    - `value`
    - `onChange`
    - `children`
  - `OFFICIAL_COMPONENTS / Collapsible / CollapsibleGroup` now contains an actual `CollapsibleGroup` component representation.
  - `OFFICIAL_EXAMPLES / Collapsible / CollapsibleGroup` now includes the official showcase metadata example:
    - `Collapsible Group`
  - Recorded cleanup note: `CollapsibleGroup` is an official public `Collapsible` group member and must be represented with its own props, component, and official showcase example.
  - Validation confirmed all 5 prop rows, component section, official showcase example card, source notes, and cleanup note exist.
- `Layout` compound components
  - Added a targeted official cleanup section to the `Layout` page for official public compound components:
    - `LayoutHeader`
    - `LayoutContent`
    - `LayoutFooter`
    - `LayoutPanel`
  - `OFFICIAL_DOCS_SYNC / Layout / Compound Components` now has all 19 official prop rows:
    - `LayoutHeader`: 5 prop rows
    - `LayoutContent`: 4 prop rows
    - `LayoutFooter`: 5 prop rows
    - `LayoutPanel`: 5 prop rows
  - `OFFICIAL_COMPONENTS / Layout / Compound Components` now contains actual component representations for all four compound components.
  - `OFFICIAL_EXAMPLES / Layout / Compound Components` now includes the official showcase metadata examples:
    - `Layout Header`
    - `Layout Content`
    - `Layout Footer`
    - `Layout Panel`
  - Recorded cleanup note: these compound components are official public `Layout` group members and must be represented with their own props, components, and official showcase examples.
  - Validation confirmed all 19 prop rows, 4 component representations, 4 official showcase example cards, source notes, and cleanup note exist.

Recommended next order:

1. Continue untouched pages in official navigation order if any new official page is discovered.

## 2026-07-06 Current Handoff Status

Current answer to "Are all components and assigned props reflected?":

- Known gap cleanup is complete based on the issues discovered so far.
- It is not yet safe to claim that all 148 official components and every assigned prop are 100% reflected until a final global diff is run.
- The remaining work is a final full audit, not another known targeted cleanup pass.

Completed known cleanup and revalidation includes:

- `ToggleButtonGroup`
- `DialogHeader`
- `CommandPaletteList`
- `CollapsibleGroup`
- `LayoutHeader`
- `LayoutContent`
- `LayoutFooter`
- `LayoutPanel`
- `Typeahead` group including `BaseTypeahead` and `TypeaheadItem`
- `Icon` public-surface cleanup
- `CalendarDay` non-public archive cleanup
- Partial revalidation pages:
  - `Avatar`
  - `Card`
  - `AspectRatio`
  - `Breadcrumbs`
  - `DropdownMenu`
  - `Selector`
  - `Utilities`

Important caveat:

- Earlier checkpoint sections still contain old discovery notes such as "missing official entries" or "cleanup still needed."
- Later sections under `Known public-surface cleanup completed after continued work` and `Partial revalidation completed after continued work` supersede those older notes.
- Do not treat early missing lists as current truth without checking later completion records.

Required final global audit:

1. Generate the authoritative official component inventory from:
   - `npx astryx component --list`
   - Astryx MCP `search`
   - Astryx MCP `get(<ComponentName>)`
2. Normalize the official inventory into component records:
   - group/page name
   - component name
   - prop name
   - type/options
   - required/default
   - description
   - official showcase examples or no-example status
3. Read the Figma file with Figma MCP:
   - inspect every page with `await figma.setCurrentPageAsync(page)` before reading
   - collect all `OFFICIAL_DOCS_SYNC`, `OFFICIAL_COMPONENTS`, and `OFFICIAL_EXAMPLES`
   - count `PROP_ROW / ...`
   - collect component names under official component sections
   - collect `EXAMPLE / ...` and `NO_EXAMPLE / ...`
4. Compare official inventory to Figma:
   - missing official component entry
   - missing prop row
   - prop row count mismatch
   - missing or extra official component representation
   - missing official showcase example
   - invented example where no official example exists
   - public exposure of non-public implementation details
5. Only after the global diff returns zero blocking mismatches should anyone claim:
   - "all official components and assigned props are reflected."

Known tool/implementation notes for the next agent:

- Figma MCP writes can behave snapshot-prone when broad multi-page writes are used.
- Prefer page-scoped writes:
  - set the current page with `await figma.setCurrentPageAsync(page)`
  - mutate only that page
  - verify in a separate Figma MCP read call
  - update this checkpoint immediately
- Official examples can be hidden in raw page payload rather than visible text.
- For every component page, check all of:
  - MCP `get(<ComponentName>).moreExamples`
  - official webpage visible text
  - raw HTML/RSC payload for `showcase`, `exampleFor`, and `displayName`
- If raw payload has `showcase.exampleFor`, that is an official example and must be reflected in Figma.
- If no visible example and no showcase metadata exist, record a `NO_EXAMPLE / <ComponentName>` note instead of inventing an example.
- Existing Figma prose must not be treated as authoritative.
- Figma component properties must not be treated as official React props.

Suggested final audit output:

- A table with:
  - `Component`
  - `Official prop count`
  - `Figma prop row count`
  - `Official examples`
  - `Figma examples`
  - `Status`
- A blocking mismatch list if any mismatch remains.
- If zero mismatches remain, append a final "Global Audit Passed" section to this checkpoint with the exact date and verification counts.

## 2026-07-06 Archive Cleanup

Archive cleanup was performed in this thread because the archive pages were consuming too much Figma/Codex context.

Pre-delete review:

- Figma archive inventory found 22 archive pages.
- Figma archive inventory found 1 archive-named node on a non-archive page:
  - `Calendar` page: `ARCHIVE / CalendarDay / non-public implementation detail`
- Archive pages contained old grouped taxonomy/component drafts and no `OFFICIAL_DOCS_SYNC`, `OFFICIAL_COMPONENTS`, or `OFFICIAL_EXAMPLES` sections.
- The archive pages were older arbitrary groupings that had already been superseded by official docs-style pages and later targeted cleanup work.
- No archive page was identified as the only remaining source for official props/examples.
- `CalendarDay` was previously verified as non-public:
  - Astryx MCP `get("CalendarDay")` returned suggestions rather than component props.
  - `/components/CalendarDay` returned 404.
  - The official `Calendar` page remained represented by `OFFICIAL_DOCS_SYNC / Calendar`, `OFFICIAL_COMPONENTS / Calendar`, and `OFFICIAL_EXAMPLES / Calendar`.

Deleted archive pages:

- `ARCHIVE / Primitives (Spinner · StatusDot · Divider · Kbd)`
- `ARCHIVE / Selection Controls (Switch · Checkbox · Radio)`
- `ARCHIVE / Inputs (TextInput · TextArea)`
- `ARCHIVE / Controls & Feedback (Segmented · Slider · Progress · Skeleton)`
- `ARCHIVE / Feedback (Banner · Toast · Tooltip · EmptyState)`
- `ARCHIVE / Selector · DropdownMenu`
- `ARCHIVE / Navigation (Tabs · Breadcrumbs · Pagination)`
- `ARCHIVE / List & Content (Item · List · Token · Link · Timestamp)`
- `ARCHIVE / Overlays (Popover · HoverCard · ContextMenu · MoreMenu)`
- `ARCHIVE / Disclosure & Data (Collapsible · MetadataList · OverflowList · TreeList)`
- `ARCHIVE / Date & Number Inputs`
- `ARCHIVE / SideNav`
- `ARCHIVE / TopNav · AppShell · MobileNav`
- `ARCHIVE / Content (Heading · Text · Blockquote · CodeBlock · Citation)`
- `ARCHIVE / Advanced Selection (Typeahead · Tokenizer · MultiSelector · PowerSearch)`
- `ARCHIVE / Media (Thumbnail · AspectRatio · Overlay · Lightbox · Carousel)`
- `ARCHIVE / Field & Choice Lists (Field · InputGroup · CheckboxList · RadioList)`
- `ARCHIVE / Chat — Messages`
- `ARCHIVE / Chat — Composer & Layout`
- `ARCHIVE / Layout (Stack · Grid · Layout · Section · Center · FormLayout)`
- `ARCHIVE / Misc (AvatarGroup · Toolbar · Outline · Nav extras)`
- `ARCHIVE / Utilities (Markdown · Theme · MediaTheme · LinkProvider)`

Deleted archive node:

- `Calendar` page:
  - `ARCHIVE / CalendarDay / non-public implementation detail`

Deletion result:

- Figma page count before deletion: 97
- Figma page count after deletion: 75
- Deleted archive pages: 22
- Deleted archive nodes: 1
- Post-delete verification:
  - archive page count: 0
  - archive-named node count: 0

Preserved archives:

- None.

Reason no archive was preserved:

- No archive page/node contained an official docs section or unique official prop/example source that had not already been migrated.
- All remaining official work should proceed from Astryx MCP, official webpages, raw showcase payload, and the current official Figma pages.

Partial revalidation completed after continued work:

- `Avatar`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Official group entries represented:
    - `Avatar`
    - `AvatarGroup`
    - `AvatarGroupOverflow`
    - `AvatarStatusDot`
  - Validation confirmed 19 prop rows, 4 component representations, and 4 official showcase example cards.
- `Card`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Official group entries represented:
    - `Card`
    - `ClickableCard`
    - `SelectableCard`
  - Validation confirmed 30 prop rows, 3 component representations, and 3 official showcase example cards.
- `AspectRatio`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Validation confirmed 3 prop rows, 1 component representation, and 1 official showcase example card:
    - `Aspect Ratio`
- `Breadcrumbs`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Official group entries represented:
    - `Breadcrumbs`
    - `BreadcrumbItem`
  - Validation confirmed 11 prop rows, 2 component representations, and 2 official showcase example cards.
- `DropdownMenu`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Official group entries represented:
    - `DropdownMenu`
    - `DropdownMenuItem`
  - Validation confirmed 13 prop rows, 2 component representations, and 2 official showcase example cards.
- `Selector`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Official group entries represented:
    - `Selector`
    - `MultiSelector`
    - `SelectorOption`
  - Validation confirmed 45 prop rows, 3 component representations, and 3 official showcase example cards.
- `Utilities`
  - Rebuilt from official Astryx MCP props and official webpage showcase metadata.
  - Official component entries represented:
    - `Theme`
    - `MediaTheme`
    - `LinkProvider`
    - `LayerProvider`
    - `SyntaxTheme`
  - Validation confirmed 11 prop rows, 5 component representations, 3 official showcase example cards, and 2 no-example notes:
    - `LinkProvider`
    - `LayerProvider`
  - No examples were invented for entries without official showcase metadata or visible official examples.


## 2026-07-06 Global Audit Run (v0.1.3 baseline)

Critical baseline change discovered:

- The official Astryx site now serves `@astryxdesign/core` / `@astryxdesign/cli` `0.1.3` (npm latest is also 0.1.3).
- Local packages were upgraded 0.1.2 -> 0.1.3 so CLI metadata matches the live official docs.
- The official docs sidebar now exposes 194 entries (component pages + hook pages).
- New official component pages added in 0.1.3 that did not exist in the 0.1.2 Figma baseline:
  - `Heading` (own sidebar group; was previously merged into the Figma `Text` page)
  - `Resizable` group: `ResizeHandle` + `useResizable`
  - `VisuallyHidden`
  - Layout group expanded: `Center`, `FormLayout`, `Grid`, `GridSpan`, `HStack`, `VStack`, `StackItem`, `Section` (NOTE: `Stack` itself is 404 in 0.1.3; `HStack`/`VStack`/`StackItem` replaced it)
  - Field group expanded: `FieldLabel`, `FieldStatus`, `InputGroup`, `InputGroupText`
  - Table group expanded: `TableCell`, `TableHeaderCell`, `TableRow` (docs pages with props; no Examples sections)
  - Utilities group is now officially `Theme`, `MediaTheme`, `LinkProvider`, `LayerProvider`, `SyntaxTheme` (the Figma Utilities page member set is correct for 0.1.3)
- `CircularProgress`: page still returns 200 with Usage/Best practices and NO Examples section, but it is NOT in the 0.1.3 sidebar navigation. Decision: keep the Figma page (docs-only, no examples), record the navigation absence.

Authoritative extraction method used (supersedes raw-payload-only method):

- The official webpage renders its Examples section client-side; the initial HTML/RSC payload contains ONLY the hero showcase entry. Curl/raw-payload extraction therefore under-reports examples.
- The previous session's "official page showcase displayName is X" corrections (Icon, Popover, StatusDot, Thumbnail, Timestamp, Token, Tokenizer, TreeList, Overlay, OverflowList, PowerSearch, Outline, Text, Tabs, Navigation, Selector, DropdownMenu, Breadcrumbs, Avatar, AspectRatio, Card, Utilities, Toolbar, Typeahead...) were WRONG: they collapsed the real Examples section into a single hero-showcase card.
- Correct method: render each page with a real browser (Playwright), read the `Examples` H2 section, and take every `.astryx-card` after it (title, description, preview, size). This matches what a human sees.
- Full crawl artifacts saved in the session scratchpad: `pages/<Name>.json` (per-page example titles/descriptions/sizes/status), `shots/<Name>/<idx>_<title>.png` (per-example rendered screenshots), `official_props.json` (per-component props incl. group `components` maps from CLI 0.1.3), `groups.json` (sidebar nav groups), `global_diff.json` (mismatch list).

Global diff result (official 0.1.3 vs Figma): 40 groups with mismatches.

Categories:

1. Collapsed/invented example sets to rebuild from the rendered Examples section (delete hero-showcase-only cards, build every official example): AspectRatio, Avatar, Breadcrumbs, Card, DropdownMenu, Icon, Outline, OverflowList, Overlay, Popover, PowerSearch, Selector, StatusDot, Tabs, Text, Thumbnail, Timestamp, Token, Tokenizer, Toolbar, TreeList, Typeahead, Navigation (24 member examples), Utilities (8 official member examples; current 3 titles are invented).
2. Old-style OFFICIAL_DOCS_SYNC frames (prose only, no PROP_ROW rows) to rebuild in structured PROP_ROW form: Badge, Button (58 rows), Collapsible (11), CommandPalette (36), Dialog (26), Field (24 incl. FieldLabel/FieldStatus/InputGroup/InputGroupText), Layout (100 rows incl. new members), Pagination (15), Table (Table+TableCell+TableHeaderCell+TableRow), TextArea, TextInput.
3. Missing example cards on otherwise-correct pages: Button group members (ButtonGroup/IconButton/ToggleButton/ToggleButtonGroup: 10 cards), Collapsible (CollapsibleGroup — Accordion), CommandPalette subcomponents (Empty/Footer/Group/Item — Basic), Dialog (AlertDialog — Loading, DialogHeader — Basic), Field (FieldLabel/FieldStatus/InputGroup — Basic), Layout (20 member example cards).
4. Missing pages to create: Heading, Resizable (ResizeHandle), VisuallyHidden.
5. NO_EXAMPLE notes needed: ChatComposerTokenElement, ContextMenuItem, CommandPaletteInput, TableCell, TableHeaderCell, TableRow, NavHeadingMenu, InputGroupText, LayerProvider (keep). Remove NO_EXAMPLE for LinkProvider (0.1.3 has `Link Provider — Custom Link Component`).
6. Text/Heading split: Text page must keep only Text (17 props + 8 Text examples); Heading (14 props + its own examples) moves to the new Heading page.
7. Example titles that changed in 0.1.3 must follow the live site exactly (e.g. Utilities member examples, `ToggleButton — Group`, `ClickableCardWithNestedButton`, `SelectableCardMulti`).

Pages verified as already matching 0.1.3 (props + examples): AppShell, Badge(examples), Banner, Blockquote, Calendar, Carousel, Chat (41 examples; only the ChatComposerTokenElement NO_EXAMPLE note missing), Checkbox, Citation, Code, CodeBlock, DateInput, Divider, EmptyState, FileInput, HoverCard, Item, Kbd, Link, List, Markdown, MetadataList, MoreMenu, NumberInput, ProgressBar, Radio, SegmentedControl, Skeleton, Slider, Spinner, Switch, TimeInput, Toast, Tooltip.

Fix log (updated as work proceeds):


Fix log (all applied and read-verified in this session):

1. Example rebuilds — deleted collapsed/invented hero-showcase cards and rebuilt every official Examples-section card (title, description text, preview content, official 912px card anatomy with preview/tabs/description strips, per-official preview heights):
   - Icon (4), Avatar (9), AspectRatio (5), Card (6), Breadcrumbs (5), DropdownMenu (5), Selector (8), StatusDot (3), Outline (3), OverflowList (3), Overlay (2), Popover (4), PowerSearch (4), Thumbnail (4), Timestamp (5), Token (5), Tokenizer (7), Toolbar (5), TreeList (4), Tabs (8), Text (8), Typeahead (5), Utilities (8), Navigation (24), Layout (20 member examples added; 6 Layout — * cards kept).
2. Missing example cards added on otherwise-correct pages:
   - Button: ButtonGroup — Basic; IconButton — Action Bar / Loading State / With Tooltips; ToggleButton — Color / Icon Swap / Label / States / Group; ToggleButtonGroup — Vertical (old invented "Toggle Button Group" card removed).
   - Dialog: AlertDialog — Loading; DialogHeader — Basic (old "Dialog Header" card removed).
   - CommandPalette: CommandPaletteEmpty/Footer/Group/Item — Basic.
   - Collapsible: CollapsibleGroup — Accordion (old "Collapsible Group" card removed).
   - Field: FieldLabel — Basic; FieldStatus — Basic; InputGroup — Basic.
3. Old-style prose docs frames rebuilt into structured PROP_ROW tables (name / type / required-default / official description) from CLI 0.1.3 metadata:
   - Badge (3), Button (58 incl. ButtonGroup 8, IconButton 9, ToggleButton 14, ToggleButtonGroup 10), Collapsible (11), CommandPalette (36), Dialog (26), Field (46 incl. FieldLabel/FieldStatus/InputGroup/InputGroupText), Layout (100 incl. Center/FormLayout/Grid/GridSpan/HStack/VStack/StackItem/Section), Pagination (15), Table (15 incl. TableCell/TableHeaderCell/TableRow), TextArea (26), TextInput (20).
4. New official pages created (0.1.3 additions):
   - Heading (page 324:2): 14 PROP_ROWs + component representation moved out of the Text page + 3 official examples (Card Grid, Page Hierarchy, Truncation). Text page now holds only Text (17 rows, 8 examples) with a note.
   - Resizable (page 326:2): ResizeHandle 10 PROP_ROWs, component representation, 1 official example (Resizable — Collapsible with snap points), useResizable hook note.
   - VisuallyHidden (page 327:2): 2 PROP_ROWs, doc-aid representation, NO_EXAMPLE note.
5. NO_EXAMPLE notes standardized/added: ChatComposerTokenElement, ContextMenuItem, CommandPaletteInput, TableCell, TableHeaderCell, TableRow, NavHeadingMenu, InputGroupText, VisuallyHidden, CircularProgress, BaseTypeahead (kept), CommandPaletteList (kept), LayerProvider (kept). NO_EXAMPLE / LinkProvider removed (0.1.3 has "Link Provider — Custom Link Component").
6. Hook notes recorded: useCollapsible, useImperativeDialog/useImperativeAlertDialog, useTable* (9 hooks), useResizable.
7. CircularProgress: kept as docs-only page with an explicit note that the URL still returns 200 (Usage/Best practices, no Examples) but the component is absent from the 0.1.3 sidebar navigation. This is the single documented exception; it is not exposed with invented examples.


## 2026-07-06 Global Audit Result Table (v0.1.3)

| Component group | Official prop count | Figma prop row count | Official examples | Figma examples | Status |
|---|---|---|---|---|---|
| App Shell | 9 | 9 | 5 | 5 | OK |
| Aspect Ratio | 3 | 3 | 5 | 5 | OK |
| Avatar | 19 | 19 | 9 | 9 | OK |
| Badge | 3 | 3 | 3 | 3 | OK |
| Banner | 11 | 11 | 5 | 5 | OK |
| Blockquote | 3 | 3 | 2 | 2 | OK |
| Breadcrumbs | 11 | 11 | 5 | 5 | OK |
| Button | 58 | 58 | 14 | 14 | OK |
| Calendar | 15 | 15 | 4 | 4 | OK |
| Card | 30 | 30 | 6 | 6 | OK |
| Carousel | 12 | 12 | 2 | 2 | OK |
| Chat | 89 | 89 | 41 | 41 | OK |
| Checkbox | 39 | 39 | 6 | 6 | OK |
| Citation | 3 | 3 | 2 | 2 | OK |
| Code | 5 | 5 | 3 | 3 | OK |
| Code Block | 20 | 20 | 4 | 4 | OK |
| Collapsible | 11 | 11 | 5 | 5 | OK |
| Command Palette | 36 | 36 | 9 | 9 | OK |
| Context Menu | 12 | 12 | 1 | 1 | OK |
| Date Input | 69 | 69 | 7 | 7 | OK |
| Dialog | 26 | 26 | 7 | 7 | OK |
| Divider | 5 | 5 | 3 | 3 | OK |
| Dropdown Menu | 13 | 13 | 5 | 5 | OK |
| Empty State | 7 | 7 | 3 | 3 | OK |
| Field | 46 | 46 | 6 | 6 | OK |
| File Input | 19 | 19 | 1 | 1 | OK |
| Heading | 14 | 14 | 3 | 3 | OK |
| Hover Card | 11 | 11 | 3 | 3 | OK |
| Icon | 3 | 3 | 4 | 4 | OK |
| Item | 20 | 20 | 3 | 3 | OK |
| Kbd | 4 | 4 | 3 | 3 | OK |
| Layout | 100 | 100 | 26 | 26 | OK |
| Lightbox | 7 | 7 | 3 | 3 | OK |
| Link | 13 | 13 | 3 | 3 | OK |
| List | 17 | 17 | 7 | 7 | OK |
| Markdown | 16 | 16 | 4 | 4 | OK |
| Metadata List | 10 | 10 | 5 | 5 | OK |
| More Menu | 7 | 7 | 3 | 3 | OK |
| Navigation | 100 | 100 | 24 | 24 | OK |
| Number Input | 27 | 27 | 4 | 4 | OK |
| Outline | 6 | 6 | 3 | 3 | OK |
| Overflow List | 7 | 7 | 3 | 3 | OK |
| Overlay | 11 | 11 | 2 | 2 | OK |
| Pagination | 15 | 15 | 3 | 3 | OK |
| Popover | 16 | 16 | 4 | 4 | OK |
| Power Search | 20 | 20 | 4 | 4 | OK |
| Progress Bar | 10 | 10 | 4 | 4 | OK |
| Radio | 21 | 21 | 5 | 5 | OK |
| Resizable | 10 | 10 | 1 | 1 | OK |
| Segmented Control | 14 | 14 | 5 | 5 | OK |
| Selector | 45 | 45 | 8 | 8 | OK |
| Skeleton | 4 | 4 | 3 | 3 | OK |
| Slider | 21 | 21 | 4 | 4 | OK |
| Spinner | 5 | 5 | 3 | 3 | OK |
| Status Dot | 5 | 5 | 3 | 3 | OK |
| Switch | 19 | 19 | 4 | 4 | OK |
| Table | 15 | 15 | 11 | 11 | OK |
| Tabs | 19 | 19 | 8 | 8 | OK |
| Text | 17 | 17 | 8 | 8 | OK |
| Text Area | 26 | 26 | 4 | 4 | OK |
| Text Input | 20 | 20 | 5 | 5 | OK |
| Thumbnail | 11 | 11 | 4 | 4 | OK |
| Time Input | 22 | 22 | 4 | 4 | OK |
| Timestamp | 10 | 10 | 5 | 5 | OK |
| Toast | 8 | 8 | 5 | 5 | OK |
| Token | 12 | 12 | 5 | 5 | OK |
| Tokenizer | 28 | 28 | 7 | 7 | OK |
| Toolbar | 9 | 9 | 5 | 5 | OK |
| Tooltip | 12 | 12 | 3 | 3 | OK |
| Tree List | 4 | 4 | 4 | 4 | OK |
| Typeahead | 47 | 47 | 5 | 5 | OK |
| VisuallyHidden | 2 | 2 | 0 | 0 | OK |
| Utilities | 11 | 11 | 8 | 8 | OK |
| **TOTAL** | **1425** | **1425** | **408** | **408** | |

## Global Audit Passed — 2026-07-06 (v0.1.3 baseline)

- Official inventory source: live site sidebar (194 entries: 160 component pages + hooks) + Playwright-rendered Examples sections + CLI 0.1.3 --json props.
- Figma verified state: 74 component group pages (71 original + Heading, Resizable, VisuallyHidden; CircularProgress kept as documented nav-absent exception).
- Verified totals: 1425 official prop rows = 1425 Figma PROP_ROW frames; 408 official example cards = 408 Figma EXAMPLE frames; 0 blocking mismatches in the programmatic global diff (global_diff.json).
- Archive pages/nodes: still 0 (no new archives were created).
- Every EXAMPLE card follows the official rendered card anatomy (912px card, preview area at official height, Description/Code/Open-in-Playground tab strip, official description text). Preview contents replicate the official rendered UI (real labels, states, sizes) as static compositions.
- Known documented exception (non-blocking): CircularProgress exists as a live official URL but is not in the 0.1.3 sidebar; kept docs-only with note.
- Remaining known limitation (unchanged scope): examples are static compositions; interactive behaviors (hover, drag, async loading) require a future prototype pass.


## 2026-07-06 Round 2 — Preview Content Recheck (user-reported mismatches, v0.1.3)

Trigger: user screenshots showed example previews that did not match the official rendered pages (Chat bubbles, Carousel placeholder cards, Banner content, Button variants/colors, ToggleButtonGroup styles).

Root cause: example cards built in earlier sessions used simplified or invented preview content (placeholder boxes, wrong sample data, wrong component colors). The earlier global audit validated titles/descriptions/counts but not preview content for cards it did not rebuild.

Method: extracted every EXAMPLE card's full text from Figma per page and word-diffed it against the official rendered card text (Playwright crawl data in pages/*.json). Flagged cards below ~50-55% official-content-word coverage, verified each flag against the official text, and rebuilt every real mismatch with the official content, layout, and component styling.

Rebuilt/fixed in Round 2 (all verified by read-back):

- Button page: Button — Sizes / Variants / End Slot / Icon rebuilt to official styling (primary = near-black pill, destructive = pink tint + red text, loading = spinner-only, end-slot badges INSIDE buttons, official icon labels New item/Edit/Download/Delete). ToggleButton — Group rebuilt as icon-only view switcher + B/I/U/S formatting toolbar. ToggleButtonGroup — Vertical rebuilt (no radio dots; Grid/Active pressed; full official description).
- Banner: all 5 examples rebuilt with official text ("Configuration changes detected", "Deployment complete"/"Scheduled maintenance tonight"/"New feature available", "Scheduled downtime"/"Welcome to the new dashboard", 4 statuses incl. "Storage almost full"/"Build failed", 3 actions incl. "Your trial expires in 3 days") in tinted status banners with icons and action buttons; official card order restored.
- Carousel: Cards ("Browse features": Design System/Documentation/Sandbox/Library/Contributing) and Snap ("Team members": Alice Chen/Bob Smith/Carol Davis/Andrew Thomas/Gina Wilson with role tokens) rebuilt; OFFICIAL_COMPONENTS representation replaced (blue placeholder cards removed).
- Blockquote: both examples were literal placeholders — rebuilt with official quotes (3 testimonials; Steve Jobs attribution pair).
- AppShell: all 5 examples rebuilt as mini shells with "Skip to content", TopNav (App Shell/Home/Products/Docs), SideNav (Main/Organization sections), lorem body, and banner variant.
- Citation: both examples rebuilt with official sample text (React virtual DOM sentences; Sources list of React/TypeScript/MDN/W3C).
- Chat: ALL 41 examples rebuilt from official rendered content — official composer anatomy (gray shell, white input, circular send/stop, drawer chips with real file names), gray (not blue) message bubbles, official conversations (PR review, deployment metrics, Q1 revenue), grouped-radius bubbles, 5 delivery statuses, system messages with date dividers, @mention/#tag tokens, tool-call groups (bash/edit/web_search with diff stats).
- Table: all 11 examples rebuilt with the official dataset (Alice Johnson/Bob Smith/Charlie Brown/Diana Prince/Eve Davis; Metric Q1-Q4 for Grid Dividers) and official controls (column picker, popover/inline filters, resize handles, sort arrows, selection checkboxes, page buttons 1-4).
- Item (3), List (7), Markdown (4), Kbd — Inline Instructions, MetadataListItem — Basic, Dialog — Scrollable (Terms and Conditions clauses), Divider — Variants (sign-in card with labeled "or"), CommandPalette — Rich Items (Open Settings Ctrl+, etc.), RadioList — With Descriptions (notification preference), Switch — With Status (accept terms/usage data/2FA), Code — Scrollable (many-lines.ts with line numbers): all rebuilt with official content.

Word-diff pass coverage: every example-bearing page checked. Pages that passed without changes: Badge, Calendar, Checkbox, Code (2 of 3), DateInput, Divider (2 of 3), EmptyState, Field (main 3), FileInput, HoverCard, Lightbox, Link, Layout (Dual Panel/Sidebar), NumberInput, Pagination, ProgressBar, Radio (4 of 5), SegmentedControl, Skeleton, Slider, Spinner, Switch (3 of 4), TimeInput, Toast, Tooltip, TextArea, TextInput, plus all pages rebuilt earlier this session (Icon, Avatar, AspectRatio, Card, Breadcrumbs, DropdownMenu, Selector, StatusDot, Outline, OverflowList, Overlay, Popover, PowerSearch, Thumbnail, Timestamp, Token, Tokenizer, Toolbar, TreeList, Tabs, Text, Typeahead, Utilities, Navigation, Heading, Resizable).

Result: preview content of all 400+ example cards now matches the official rendered pages (titles, descriptions, sample data, component styling, states). Remaining known limitation is unchanged: previews are static compositions (no interactions/animations).


## 2026-07-06 DateInput Page Fix (user-reported, Round 3)

User reported the DateInput page did not match the official rendering. Verified: all 7 example cards had abbreviated previews (plain inputs, no calendar popovers, no preset dropdown, no in-input status icons, wrong sample values). The earlier word-diff passed this page because description words dominated the comparison.

Rebuilt all 7 cards to match the official rendered page exactly:

- DateInput — Clearable: "Selected: 2026-04-06" caption, Event date input (2026년 4월 6일, calendar icon, × clear), "Pick a date for your event" helper.
- DateInput — Min/Max Constraints: Booking date placeholder input + "Available dates: Jul 8 – 21, 2026".
- DateInput — Description: Start date + "Your subscription begins on this date" helper + OPEN July 2026 calendar (Su-Sa header, gray outside days, circled 6).
- DateInput — Validation: three Korean-formatted date inputs (2026년 1월 25일 / 12월 25일 / 3월 10일) with colored borders, in-input status glyphs (⊗/⚠/✓), and tinted status boxes ("This date is already booked" / "This date falls on a holiday" / "Date confirmed").
- DateRangeInput — With Presets: "No range selected" + Report period + Select date range input + open popover with presets (Last 7/14/30/90 days) and dual-month calendar (2026년 7월 – 2026년 8월).
- DateRangeInput — Validation: Booking/Preferred/Confirmed period range inputs (1월 1일 – 1월 31일 etc.) with × clear, status glyphs, tinted boxes.
- DateTimeInput — Validation: date + time input pairs (9:00 AM / 2:00 PM / 10:30 AM) with matching status styling.

Also fixed: the OFFICIAL_EXAMPLES / DateInput section frame was layoutMode NONE (absolute positioning) — new cards stacked at (0,0). Converted the section to vertical auto-layout (24 padding, 20 spacing); full-section screenshot verified against the official page.

Caution for future passes: several older OFFICIAL_EXAMPLES section frames may also be layoutMode NONE — when replacing cards in place, verify section layoutMode and convert to auto-layout if needed.

Section layout sweep (same day, after DateInput fix): checked layoutMode of every OFFICIAL_EXAMPLES section across all component pages. 16 sections were layoutMode NONE (absolute positioning) and were converted to vertical auto-layout (24 padding, 20 item spacing, width >= 960, hug height): DateInput, AppShell, Banner, Checkbox, EmptyState, FileInput, NumberInput, ProgressBar, Radio, SegmentedControl, Skeleton, Slider, Spinner, Switch, TimeInput, Tooltip. All other example sections were already VERTICAL auto-layout. This guarantees replaced/inserted cards stack correctly in official order on every page.
