# 2026-07-14 — Components / Styles / Shared-Library Asset Audit

Read-only audit of the Figma file `astryx_design_system` (fileKey `4YmLJEV002eWzvKLVQru5f`) against Astryx v0.1.4 official docs (CLI `npx astryx`) and the Figma best-practice guides now referenced in `advise.md`. Scope requested by user: **naming/variant conformance, detached/broken instances, hardcoded colors/dimensions, and diagnosis against the official Figma component/style/library guides.**

No file was modified. This is a findings log to drive a follow-up fix phase (page-scoped, after approval).

## Method

- Enumerated 80 pages with `page.loadAsync()` before counting (NOTE: reading `page.children` without `loadAsync` reports stale/0 counts — an earlier "empty pages" alarm was a loading artifact and was retracted).
- Scanned main `COMPONENT` / `COMPONENT_SET` subtrees only (excluding nested instance internals) for token binding.
- Cross-checked component + variant-axis names against `npx astryx component --list` and `npx astryx search`.
- Token values from `npx astryx docs tokens` (saved to scratchpad during the session).

## Structural baseline (healthy)

- 80 pages; only truly empty page is the `——— COMPONENTS ———` separator (intentional).
- Variables: 5 collections — Color (79, modes Light/Dark), Spacing (18), Shape (8), Typography (19), Motion (10). Categories match Astryx token groups. Colors are Variables, not Paint Styles (0 paint styles) — modern and correct.
- Styles: 14 text styles, 8 effect styles, 0 grid/paint.
- `CircularProgress` empty of components by design (docs-only exception, not in v0.1.4 sidebar).

## Axis 1 — Detached / broken instances: CLEAN ✅

- 3,164 instances checked via `getMainComponentAsync`; **0 broken / detached** (every instance resolves to a valid main). No action needed.

## Axis 2 — Hardcoded colors / dimensions: PARTIAL DRIFT ⚠

On main components, SOLID paints not bound to a Color variable: **1,640**; `cornerRadius > 0` not bound to a Shape variable: **772**.

Context (important — not "all hardcoded"): sampled pages (Button/Badge/Switch/StatusDot) are **~80% bound** (238 bound vs 60 unbound). The unbound tail concentrates in specific components:

| Page | mains | unbound colors | unbound radius |
|------|------:|---------------:|---------------:|
| Card | 48 | 326 | 183 |
| Chat | 37 | 187 | 89 |
| Navigation | 19 | 107 | 56 |
| Typeahead | 6 | 62 | 15 |
| Utilities | 10 | 56 | 50 |
| Calendar | 2 | 53 | 43 |
| List | 5 | 51 | 2 |
| PowerSearch | 7 | 48 | 19 |
| Timestamp | 9 | 48 | 1 |
| Tokenizer | 4 | 48 | 19 |
| Avatar | 27 | 47 | 69 |
| (…tail continues across most pages) | | | |

Two sub-classes inside the unbound set:

1. **True defects — should be bound, and some carry WRONG values.** e.g. `AvatarStatusDot` status dots use `#14a05a` (green) and `#e8415a` (red) as raw hex; Astryx tokens are `--color-success #0D8626` and `--color-error #E3193B`. So these are both unbound *and* off-value.
2. **Decorative / placeholder — likely acceptable, confirm case-by-case.** Avatar photo backgrounds `#ffffff`, avatar initials palette `#5b6bb0` / `#e0e3f5`, AspectRatio placeholder `#eef0f6`. These are demo imagery, not semantic surfaces; forcing tokens may be wrong.

**Follow-up needed before fixing:** classify each unbound hex against the Astryx token hex table — (a) exact match to a token value → bind to that variable; (b) near-a-token but off → wrong value, fix to token; (c) no match + decorative → leave, or move to a documented "demo palette". Do NOT blanket-bind.

## Axis 3 — Naming / variant conformance: DRIFT ⚠ (main issue)

62 component sets + 89 standalone components enumerated.

### 3a. Duplicate main components (old + new coexisting)
Same asset published more than once with different axes/casing — consumers can pick the wrong one (violates Figma "avoid duplicates / deprecate gracefully"):

- `AvatarStatusDot` — set with axis `Variant` AND another with `variant`.
- `ClickableCard` — `Title#/Body#/State` (legacy) AND `Label#/isDisabled#/variant` (new).
- `SelectableCard` — `Title#/Body#/Selected` (legacy) AND `Label#/isSelected#/isDisabled#/variant` (new).
- `Calendar` — two standalone components on the Calendar page.

### 3b. Variant-axis casing is inconsistent across the library
Two conventions mixed:
- Legacy capitalized: `Variant`, `Size`, `State`, `Status`, `On`, `Checked`, `Selected`, `Open`, `Loading`, `Sortable`, `Shape`, `Type`, plus `Show Icon` / `Show Status` / `Show Label` / `Show Description`.
- Astryx-aligned lowercase/boolean: `variant`, `size`, `density`, `type`, `isDisabled`, `hasClear`, `hasDivider`, `hasLineNumbers`, `isSelected`, `isPulsing`, `isLive`, `isStreaming`, `isStopShown`.

Astryx code props are lowercase camelCase with `is*/has*` booleans, so the **lowercase set is correct and the capitalized/`Show X` set is the drift.** Newer components (Card v2, Chat) already migrated; older ones (Button, Badge, Switch, Checkbox, Banner, Toast, etc.) did not. Per the `advise.md` cross-check rule, variant axes must equal real Astryx props → align casing/boolean naming to the CLI `--json` prop names.

### 3c. Stray variant components outside their set
`PowerSearch` has a proper `PowerSearch` set AND three loose standalone components named `size=sm` / `size=md` / `size=lg` (variant fragments not inside a COMPONENT_SET). 0 instances reference them; not published → safe to remove.

### 3d. Publish topology is inconsistent — the duplicates are NOT a safe mechanical cleanup ⚠⚠
Verified via node `.key` vs `search_design_system` published `componentKey` + live-instance scan (3,164 instances):

| Component | "Loose/legacy" node | "OFFICIAL_COMPONENTS" node | Which is PUBLISHED | Live instances (loose) |
|---|---|---|---|---|
| SelectableCard | `27:19` (2 variants) | `504:233` (13 variants) | **loose `27:19`** (key 1c90cc10) | 0 |
| AvatarStatusDot | `19:6` (set, 3) | `500:79` (set, 3) | a THIRD node (published key 61e9240d, assetType `component`) — neither set | **56** |
| ClickableCard | `27:12` (2) | `504:141` (13) | not resolved (search didn't return) | 0 |
| Card | `27:3` (single) | `504:62` (12-set) | not resolved | 0 |
| Calendar | `52:12` | `198:105` | not resolved | 0 |
| PowerSearch size=* | `505:2/13/24` | `505:35` (set) | strays not published | 0 |

Key facts that break the "delete the loose ones" plan:
- For **SelectableCard**, the *published* asset consumers get is the loose 2-variant `27:19`; the polished 13-variant `504:233` was built but **never published**. Deleting the loose one would break consumers.
- For **AvatarStatusDot**, 56 live instances point at the loose `19:6`, and the *published* asset is a third node entirely.
- So OFFICIAL_COMPONENTS frames are **not reliably the published source**; publish status must be checked per component, and the answer is inconsistent.

**Conclusion:** duplicate reconciliation is a publish/versioning decision (promote the rebuilt version + migrate, or abandon the rebuild), not a mechanical delete. Needs maintainer direction before any deletion. The 7 zero-instance, non-published strays (PowerSearch size=*, and any loose node confirmed unpublished) are separately safe to remove, but confirm publish status per node first.

### 3e. Resolved publish topology (verified via search key ↔ node key)
The team library `lk-fe74` carries **stale + double-published** entries:

- **Calendar** — BOTH published: `198:105` (OFFICIAL_COMPONENTS, key 7153c161) AND legacy `52:12` (key 743570a1).
- **ClickableCard** — legacy set `27:12` (key 28f219df) published; a third published `component` (key 2ed5f259) exists; new `504:141` (284e23a7) NOT in results.
- **SelectableCard** — only legacy `27:19` (key 1c90cc10) published; new `504:233` NOT published.
- **AvatarStatusDot** — published key `61e9240d` resolves to **no node in the file (stale)**. Two sets exist: legacy `19:6` axis `Variant` (children `Variant=success/neutral/error`) with **56 live instances**; new `500:79` axis `variant` (lowercase). Axis-case mismatch → instance re-point needs `Variant=X → variant=X` mapping.

### DECISION (user, 2026-07-14): OFFICIAL_COMPONENTS (latest rebuilds) are canonical.
Promote the rebuilt versions; migrate/remove legacy. This is a **breaking** library change.

### Execution plan (API vs manual)
Plugin API **cannot publish/unpublish** — those steps are manual in the Figma UI. Per component pair:
1. (API) Ensure the OFFICIAL_COMPONENTS version is complete/correct.
2. (API) Re-point in-file instances from legacy → canonical (only AvatarStatusDot has any: 56, across a Variant→variant case change).
3. (API) Delete the legacy loose node(s) once 0 in-file instances remain.
4. (USER, UI) Republish the library so consumers get the canonical set; review the removed/renamed assets in the publish dialog and write a changelog (`[BREAKING]`).
Order: AvatarStatusDot re-point first (removes the only live dependency), then deletions, then user publish. PowerSearch `size=*` strays (0 inst, unpublished) can be deleted anytime.

## Axis 4 — Non-official ("invented") components: RETRACTED ✅ (all official)

Initial pass flagged 6 components as absent from `astryx component --list` / `search`. This was a **false positive** — direct `npx astryx component <Name>` confirms all 6 are official, with real docs, props, and import paths:

- `NavHeadingMenu` ← `@astryxdesign/core/NavMenu`
- `MobileNavToggle` ← `@astryxdesign/core/MobileNav`
- `ChatComposerTokenElement` ← `@astryxdesign/core`
- `ContextMenuItem` ← `@astryxdesign/core` (re-exported from DropdownMenuItem)
- `LayerProvider` ← `@astryxdesign/core/Layer`
- `SyntaxTheme` ← `@astryxdesign/core/theme`

**Keep all 6** (component + usage/props). No removal.

**Method lesson:** `component --list` groups by category and omits some subcomponents/re-exports; `search` is fuzzy. The authoritative existence check is `npx astryx component <Name>` directly — use it before ever calling something "invented".

## Priority for the fix phase (all page-scoped, verify-after-write)

1. **Deduplicate** 3a — decide which version is canonical (the Astryx-prop-aligned `variant/isX` ones), delete/deprecate the legacy twin, re-point instances.
2. **Fix stray PowerSearch variants** 3c.
3. **Bind true-defect colors/radii** 2 (class a/b only) — starting with wrong-value status colors; leave decorative placeholders unless user wants a demo-palette collection.
4. **Normalize variant naming** 3b — rename axes/props to match `astryx component <Name> --json` (lowercase, `is*/has*`). This is a **breaking** library change → changelog + consumer note; do last, with separate approval.

Axis 1 (instances) and Axis 4 (component officialness) need no work.

User decision (2026-07-14): proceed **safest-first, staged** (non-breaking before breaking); keep all 6 Axis-4 components.

## EXECUTION RECORD (2026-07-14, later session) — fix phase steps 1–3 DONE

All changes page-scoped, verified after each write. Post-run integrity: **3,127 instances, 0 broken/detached** (count dropped from 3,164 because deleted legacy mains contained nested instances internally).

### 1. AvatarStatusDot dedupe ✅ (with a plan correction)

**Finding that changed the plan:** the "canonical" OFFICIAL_COMPONENTS set `500:79` was anatomically WRONG — each variant was a full 44×44 demo avatar (ellipse + "AC" initials) with the dot, and its dot colors were the unbound wrong palette (`#14a05a`/`#9aa0a6`/`#e8415a`). The legacy set `19:6` was the one with correct dot-only anatomy and correct token-bound fills. Official docs (`component AvatarStatusDot --json`): subcomponent of Avatar, dot-only, props `variant/label/icon`.

Executed per plan step 1 ("ensure the OFFICIAL_COMPONENTS version is complete/correct" first):

- Rebuilt `500:61/67/73` as 12×12 dot-only (cornerRadius 9999, stroke 2 INSIDE), mirroring legacy anatomy. Fills bound: success→`color/success`, neutral→`color/icon/gray` (legacy precedent; `--color-neutral` is a translucent overlay token, not a dot gray), error→`color/error`; stroke→`color/background/surface`.
- Swapped the 15 `status` instances inside the Avatar main components (set `19:57`) from legacy `19:3` → `500:61`; sizes (10/20/32) preserved. The 41 nested Templates instances propagated automatically. The Avatar set's `Status` INSTANCE_SWAP prop default now points at `500:61`.
- Note: `status` is `visible:false` by default (controlled by `Show Status#19:16`) — dots not appearing in the bare set screenshot is by design. Verified rendering via `EXAMPLE / Avatar — Status Dot` (296:43) and `EXAMPLE / AvatarStatusDot — Variants` (297:60): correct.
- Deleted legacy set `19:6` after confirming 0 references file-wide.

### 2. Legacy duplicates + PowerSearch strays deleted ✅ (0 instances confirmed first, file-wide scan)

- Card page: deleted `27:3` (Card single), `27:12` (ClickableCard `State` set), `27:19` (SelectableCard `Selected` set). Remaining: only `504:62/141/233`. No loose components left (the audit's unresolved "third ClickableCard" key `2ed5f259` has no node on the page).
- Calendar page: deleted legacy `52:12`; only `198:105` remains.
- PowerSearch page: deleted strays `505:2/13/24`; set `505:35` intact.

### 3. True-defect status colors bound ✅

- StatusDot set `492:27` (5 variants, pulse + dot-core ellipses): success→`color/success`, warning→`color/warning` (was #d69e05, token #E9AF08), error→`color/error` (was #e8415a), accent→`color/accent` (was #1467e6, token #0064E0), neutral→`color/icon/gray` (was #9aa0a6). Screenshot-verified.
- Timestamp set `495:34`: all 8 `live` dot ellipses → `color/success` (was #14a05a). Live dots hidden by default variant — bound regardless.

### 4. Token-hex classification pass (read-only) — result: NO safe mechanical binds remain

Scanned all mains file-wide (fills+strokes, excluding nested-instance internals): **1,023 unbound solids across 96 distinct hexes**. Against the 79 Color variables (Light mode):

- **Exact token match: only `#ffffff` (97×)** — and it matches SEVEN tokens (`on-accent`, `background/surface`, `background/card`, `background/popover`, `on-dark`, `on-success`, `on-error`) → semantically ambiguous, cannot auto-bind.
- Everything else is **near-token drift or decorative**, e.g. `#1c1c1f` ×178 (text, ≈text/primary?), `#6b737a` ×114 (secondary text?), `#e5e5e5` ×101 (borders?), `#0d0d0d` ×85 (Calendar/Navigation text), `#1467e6`/`#0f52d1`/`#2563eb` (accent-ish blues), avatar demo palette `#e0e3f5`/`#5b6bb0`, Card tint backgrounds (`#eff6ff` etc. ×3 each — probably the official `*-muted`/tint ramp?).
- Conclusion: the remaining binding work is **per-hex semantic mapping** (hex → intended token, checked against official rendered colors), not mechanical. Needs either user direction or a follow-up audit that derives each component's official colors from the crawl screenshots/source. Deferred.

### 5. AspectRatio insertable rep upgraded to a `ratio` variant set ✅ (user request + approval, 2026-07-14)

User asked why the AspectRatio insertable component was single with no ratio picker. Cause: official `ratio` prop is a required free `number` (not a union), so the mirror's enum-only variant rule produced a single rep — which was also off-spec (120×68 ≈ 1.765, neither 16:9 nor anything). The official docs DO demonstrate a concrete value set: showcase template `AspectRatioShowcase` renders exactly 1:1 / 4:3 / 16:9 at equal height; best practices name 16/9 and 4/3; prop doc says "e.g. 16/9, 1".

Executed (user picked option B): replaced single `267:38` (0 instances file-wide) with COMPONENT_SET `883:14` `AspectRatio`, axis `ratio` = `1:1` (72×72) / `4:3` (96×72) / `16:9` (128×72) — exact ratios, equal height per the official showcase. Placeholder motif (sun + mountains, decorative #eef0f6 palette, kept per audit class-c) cloned and re-scaled per variant. Set description = exact official usage description. Additive/non-breaking library change. Screenshot-verified in `OFFICIAL_COMPONENTS / AspectRatio`.

Precedent note: a variant axis for a non-union prop is acceptable ONLY when every value comes from official docs (here: showcase + best practices + prop example). Do not generalize to arbitrary numeric props.

### Remaining (deferred)

- **Manual (user, Figma UI):** republish team library `lk-fe74` — removals: legacy AvatarStatusDot/ClickableCard/SelectableCard/Card/Calendar entries (incl. the stale `61e9240d` and double-published Calendar `743570a1`); additions: ensure `504:233` SelectableCard, `500:79` AvatarStatusDot etc. are published. Changelog `[BREAKING]`.
- **Priority 3 remainder:** per-hex semantic color mapping (above).
- **Priority 4:** variant-axis naming normalization (legacy `Variant/Size/State/Show X` → Astryx `variant/size/isX`) — breaking, needs separate approval.

## Caveats

- Color/radius counts are raw; class a/b/c split still pending a token-hex classification pass.
- "Invented" list is from fuzzy `search`; confirm each is not an intentional documentation helper before deletion.
- Any variant-rename is a **breaking change** for consumer files — sequence with a changelog and (if possible) keep deprecated aliases briefly.
