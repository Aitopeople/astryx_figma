# 2026-07-14 — Detail Comparison vs Official Docs + Industry Benchmark

Read-only assessment. Two axes: (1) detail-level diff of the Figma foundations/mechanics against official Astryx docs (CLI), (2) benchmark against Material 3 / Primer / Polaris / Carbon / Atlassian / Fluent 2 Figma library practices. No Figma changes made.

## Part 1 — Official-docs detail diff

### Foundations: value-exact ✅ (no drift found)

- **Variables (5 collections)** all match official token values exactly:
  - Color 79 (Light/Dark modes; spot-checked incl. accent #0064E0/#2694FE, neutral #0536591A/#DFE2E533, status trio, all 10 tint families).
  - Spacing 15 (`spacing/0…12`) + `size/element-sm|md|lg` 28/32/36 — confirmed official (`--size-element-*` in `docs tokens`).
  - Shape 7 radii + `border-width` 1 — confirmed official.
  - Typography 19: geometric scale 6→42px matches `round(14×1.2^step)` rem table exactly; weights 400/500/600/700.
  - Motion 10: durations + `ease/standard` cubic-bezier(0.24,1,0.4,1). (scopes=0 — inapplicable in Figma pickers, fine.)
- **Text styles (14)**: every size/weight/line-height matches the semantic type scale (`--text-*-size/weight/leading`), e.g. Heading/1 = 2xl(24) semibold ×1.3333 = 32 ✓, Display/2 = 4xl(35) ×1.2571 = 44 ✓. Line heights correctly 4px-grid snapped.
- **Effect styles (8)**: Shadow Low/Med/High dual drop-shadows and 5 inset rings match `docs elevation` light values to the alpha digit (e.g. Inset/Hover #05365926 = rgba(5,54,89,.15)).

### Known deviations / gaps (detail level)

1. **Font family substitution, undocumented**: official `--font-family-body/heading` = system stack (-apple-system…Segoe UI), `--font-family-code` = "SF Mono", Monaco, Consolas. Figma uses Inter / Roboto Mono. A reasonable, necessary approximation (Figma cannot express stacks) — but it should be recorded in advise.md as a conscious substitution rule.
2. **Text styles applied to 0/658 TEXT nodes** on mains. Styles are defined but never used; all component text is raw values. (Values happen to be correct sizes/weights — fidelity is visual-only, not systemic.)
3. **Spacing binding ~10%**: 84/882 auto-layout gaps, 90/882 paddings bound to `spacing/*`.
4. **Radius binding**: 772 unbound (07-14 audit); radius token values are unique (0/4/8/12/28/9999) except page=chat=28, so exact-value auto-binding is largely safe.
5. **Color binding**: 1,023 unbound solids / 96 hexes on mains; only #ffffff matches a token exactly and it is 7-way ambiguous. Everything else is near-token drift (e.g. #1c1c1f×178 ≈ text/primary #0a1317; #6b737a×114 ≈ text/secondary #4e606f) or decorative. Consequence: **dark mode is partially broken** for the unbound tail.
6. **Effect styles are light-only**: docs shadows are `light-dark()`-adaptive; Figma effect styles have no modes. Workaround: bind effect color to a moded Color variable (e.g. `color/shadow`), or accept light-only and document.
7. **Component descriptions 106/143** — 37 missing (list in scan; Navigation subcomponents are the biggest block). All missing texts exist officially (`component <Name>` description). CLI also exposes official `keywords` arrays — none are used in descriptions for Assets-panel search.
8. **Official icon registry not mirrored**: `docs icons` defines 26 semantic names (close, chevronDown, … microphone). Figma has the Icon doc page (correct) + an MDI reference page, but no 26-name icon component set, and only 5 INSTANCE_SWAP properties library-wide. Official props with icon/ReactNode slots (`slotElements` in CLI) could expose swap slots.

## Part 2 — Benchmark vs major DS Figma libraries (agent research)

Snapshot of practices (full sources in the research result, main ones: primer.style/product, polaris-react.shopify.com/contributing/figma-ui-kit, Carbon "All themes" Medium post, fluent2.microsoft.design, m3.material.io blog):

| # | Practice (adoption-ranked) | Who | Astryx mirror status |
|---|---|---|---|
| 1 | Component/prop names mirror code API 1:1 (Primer: camelCase, `?`-booleans) | all 6 | Partial — new sets yes; legacy axes `Variant/Size/State/Show X` still drifted (= queued Priority-4 normalization, breaking) |
| 2 | Semantic tokens as variables with modes | all 6 | ✅ foundations; ✗ component internals (binding gaps above) so components don't re-theme |
| 3 | Full interaction-state variant axis (rest/hover/focus/pressed/disabled) | M3, Primer, Carbon, Fluent, Polaris | ✗ by policy — states aren't Astryx props; Golden Rule forbids inventing axes. **Policy decision, not defect** |
| 4 | Primitive→semantic variable aliasing | Carbon, Fluent, Primer | ✗ flat values; e.g. text styles could bind fontSize/family to Typography variables (mirrors the official var() layering) |
| 5 | Multi-library split (tokens/components/icons/templates) | Primer(5), Fluent, Carbon, Atlassian | single file; defer (publish topology already pending cleanup) |
| 6 | `[DEPRECATED]`/"(Legacy)" naming + freeze for stale assets | Primer, Carbon, Atlassian | n/a now (legacy deleted); adopt as convention for future breaking changes |
| 7 | Published changelog / in-file Release Notes page | Polaris, Primer, Carbon, M3 | ✗ — repo has logs/, but Figma consumers see nothing. Needed anyway for the pending `[BREAKING]` republish |
| 8 | Branch-based change control | Primer, Polaris | blocked by plan/seat (same as Code Connect) |
| 9 | Boolean/text/swap props + `_Slot` components over variant explosion | Primer, Fluent, M3 | Good (76 bool / 110 text) but swap slots underused (5) vs official slot props |
| 10 | Lifecycle gating of publication | Primer | equivalent exists (verified-baseline rule v0.1.4) ✅ |
| 11 | Descriptions with usage guidance + doc links + search keywords | M3, Figma-endorsed | Partial (106/143, no links/keywords) |
| 12 | Layer-name / ≤2-level nesting hygiene | Primer, Fluent | Generally fine |
| 13 | Extras: per-page mode switch QA (Carbon), tokens plugin (Atlassian), Code Connect | various | Code Connect blocked by seat; per-page dark QA becomes possible after color binding |

## Prioritized improvement backlog

**A. Non-breaking, fully official-sourced (safe to execute):**
1. Apply the 14 text styles to all 658 TEXT nodes (mechanical match by family/size/weight; mismatches surface real drift). Then bind text-style fontSize/family to Typography variables (aliasing, practice #4).
2. Fill 37 missing component descriptions; add official description + doc URL (`astryx.atmeta.com/components/<Name>`) + official CLI `keywords` to all 143.
3. Exact-value spacing/radius binding on mains (gap/padding → `spacing/*`; cornerRadius → `radius/*`; radius 28 → container-level judgment page vs chat).
4. Build the official 26-icon semantic set (one `Icon` component set, axis = official registry name) + expose INSTANCE_SWAP slots for official `slotElements` props.
5. Document the Inter / Roboto Mono font substitution rule in advise.md.
6. Add an in-file Release Notes page (Polaris pattern) seeded with the pending `[BREAKING]` dedupe notes.

**B. Requires user approval / mapping decisions:**
7. Per-hex semantic color mapping (~1,023 values; visual changes — e.g. #1c1c1f → text/primary #0a1317). Deliver a mapping table first.
8. Variant-axis naming normalization (breaking; benchmark practice #1 strongly endorses it).
9. Dark-mode QA pass (per-page mode switching) — meaningful only after 7.
10. Interaction-state variants — industry norm but violates the mirror's Golden Rule as written; needs an explicit policy decision (recommend: keep doc-mirror purity; document the trade-off).

**C. Deferred/structural:** multi-library split; Figma branching + Code Connect (plan/seat-gated).

## EXECUTION RECORD — backlog A executed (2026-07-14/15 session)

All six A-items done; page-scoped writes across all 67 component pages, verified by a final file-wide sweep: **3,153 instances / 0 broken; descriptions 169/169 mains; doc links 143/143 component mains** (the 26 icon-registry components carry usage descriptions instead).

1. **Text styles applied — with a scope correction.** The cluster scan revealed a NEW drift class: much of the mirror's component text is **off the official type scale entirely** (12.5/13/11.5/13.68 px etc., line-height AUTO everywhere; official scale has no such steps). Blanket-applying styles would visually change ~400 nodes without official-render verification, so styles were applied only on exact family+weight+size match (line-height AUTO normalized to the official 4px-grid value): **230/658 nodes styled** (Supporting 12, Body 14, Label 14 Medium, Heading/4-6, Large 17, Code 14 RM, Displays). Spot-checked Button/Calendar pages — no clipping. **Follow-up (backlog B): off-scale text fidelity round** — per-component diff of preview text sizes vs official rendered pages (crawl), then re-scale + style the remainder. The mixed 17px SemiBold ambiguity (Heading/3 ≡ Large, identical values) was resolved as Large except on the Heading page.
2. **Text styles → Typography variables**: all 14 styles bind fontFamily/fontSize/fontWeight (42/42 fields) to `font-family/*`, `font-size/*`, `font-weight/*`. Resolved values unchanged.
3. **Descriptions**: official description + `Keywords:` (official CLI keywords) + `Import:` path written to all 142 CLI-backed mains (0 missed); `documentationLinks` set to `astryx.atmeta.com/components/<PageName>` (group page URL — subcomponents link to their official group page). Source: bulk `component <Name> --json` fetch (scratchpad `component_meta.json`; fetch needs `shell=True` + project cwd).
4. **Spacing/radius binding (exact-token values only)**: gaps 84→**315** bound, padding fields 90→**939**, radii →**229** nodes (4→inner, 8→element, 12→container, 28→page (chat on Chat page), 9999/10000→full). Skipped: gap=0, SPACE_BETWEEN rows, mixed radii, non-token values (10px etc.).
5. **Icon registry + swap slot**: `OFFICIAL_ICON_REGISTRY / Icon` frame (893:32) with 26 `icon/<name>` components (24×24, official `docs icons` usage text as description, fills bound to `color/icon/primary`, glyphs = existing Material substitution). Icon set `498:50` now exposes an `icon` INSTANCE_SWAP property (default = previous glyph, 26 preferred values) wired through all 4 size variants. **Slot follow-up list**: 94 official components have slot props; 19 have icon-type slots (AvatarStatusDot, Badge, Banner, BreadcrumbItem, Button, IconButton, ToggleButton, ChatSystemMessage, EmptyState, MetadataListItem, MoreMenu, NavIcon, SideNavHeading, TopNavItem, TopNavMegaMenuItem, SegmentedControlItem, Tab, Token, TypeaheadItem) — INSTANCE_SWAP-ification per component deferred.
6. **advise.md**: font substitution rule documented (Inter/Roboto Mono stand in for the official system stack/SF Mono — conscious deviation, not drift).
7. **📋 Release Notes page** (895:2) created after the Cover, seeded with the pending `[BREAKING]` dedupe entry + `[UPDATE]` entries (AspectRatio variants, status-color binding, icon registry, this rollout).

Method note: earlier "Avatar ×2 mains" flag on the Avatar page — `514:2` "Avatar" coexists with set `19:57`; both matched the CLI name and both received the official description. Whether 514:2 is an intentional second rep needs a quick check in the next session (potential 3a-style duplicate).

## EXECUTION RECORD — backlog B executed (2026-07-15 session)

User approved "순서대로 모두 진행" (do all four, in order): ②→①→④→③. All page-scoped, verified after each; final file-wide sweep: **3,153 instances / 0 broken.**

### ② Off-scale text fidelity — DONE
Crawl still present (re-confirmed). Off-scale text (sizes not on the official geometric scale 6/7/8/10/12/14/17/20/24/29/35/42) snapped to the nearest scale step, then the matching text style applied; tie sizes (13/11/9) resolved by path context (desc/caption/timestamp/weekday/shortcut → smaller step). Text/Heading showcase reps mapped variant→official style exactly (display-1 Bold30→Display/1 Reg42 etc.), screenshot-verified no clipping. Skipped as decorative glyphs (not type-scale text): avatar initials (SemiBold 51/19, Medium 16/13.68), Typeahead suggestion initials (Medium 9). **Result: text-style coverage 230→521/658; remaining 9 off-scale = the intentional decorative glyphs.** Screenshot-verified Card/Tabs/Markdown/Text/Heading.

### ① Color semantic mapping — DONE
Built a bucket-aware mapper (TEXT / STROKE / SHAPE-fill), picking the nearest token **within the semantically-allowed set for that bucket** (so text#1c1c1f→text/primary, not the pure-nearest background/inverted), comparing against tokens composited over white so translucent tint/border tokens match the opaque mirror fills. Hue tints (Card/Token/PowerSearch/Tokenizer/Chat mentions) mapped to `background/<hue>`+`text/<hue>` by variant/path. Skipped decorative: avatar palette, AspectRatio placeholder art, Theme/SyntaxTheme demo swatches, cursors, semi-transparent overlays. **Result: bound solids 1,013→~1,350; ~85 remain unbound = all intentional decorative/demo/ambiguous (Chat send-button dark, etc.).** Screenshot-verified Card/Chat/Calendar/Token. Now theme-correct in dark mode where previously raw hex broke it.

### ④ Icon swap slots — DONE (scoped by Golden Rule)
Button/IconButton/Badge already had `Icon` INSTANCE_SWAP props → added the 26-icon registry as `preferredValues` (via `editComponentProperty`). Added new `icon` INSTANCE_SWAP slots (wired to registry) on EmptyState + NavIcon (they render a swappable content icon). **Intentionally NOT wired**: fixed control glyphs (MoreMenu •••, Token ×, SideNavHeading ▾, Banner status-icon — semantic, not user-swappable) and components that render no icon in their rep (Tab, SegmentedControlItem, TypeaheadItem, etc. — adding one would invent visual content).

### ③ Variant-axis normalization — DONE (safe 1:1 subset; breaking)
Verified every affected component's real props via `component --json` first. Renamed ONLY axes that map 1:1 to a real official prop with matching values:
- Badge/Breadcrumbs/StatusDot `Variant→variant`; Banner `Status→status`; Toast `Type→type`; Avatar/Button/IconButton/ToggleButton/TextInput `Size→size`
- `State{default,disabled}→isDisabled{false,true}` on Button/IconButton/Switch/CheckboxInput (official `isDisabled:boolean`)
- ToggleButton `Selected→isPressed`; Switch `On→value`; Collapsible `Open→isOpen`; CheckboxInput `Checked→value` (all official props, values matched)

**Intentionally left (renaming would invent a prop or mismatch)** — 11 axes: Avatar.Type (render mode, no prop), Skeleton.Shape (uses radius), TableHeaderCell.Sortable (Table uses columns config), Radio/SegmentedControlItem.Selected (derived from parent), ProgressBar.Status (values ≠ variant enum), and `.State` axes encoding CSS hover/focus (CommandPaletteItem, TableRow, TextArea, TextInput). Breaking change → recorded in the 📋 Release Notes page for the publish.

All four backlog-B items complete. At this point the remaining program items were manual library republish (user) and the Avatar `514:2` duplicate check resolved below.

## EXECUTION RECORD — Avatar duplicate resolved (2026-07-15)

`514:2` was confirmed to be a simplified duplicate, not an intentional second representation: it was a single 44px `Avatar` component exposing only a `Name` text property, while canonical set `19:57` contains the official five `size` values, three render types, initials, status visibility, and status swap behavior. Neither main had direct file instances.

Removed `514:2` from the document tree and moved canonical set `19:57` into `OFFICIAL_COMPONENTS / Avatar`. Reordered the insertable mains to the official documentation sequence: Avatar, AvatarGroup, AvatarGroupOverflow, AvatarStatusDot. Expanded the page-scoped component frame and shifted the examples section by the same delta. Separate readback and screenshot verification found no overlap; file-wide integrity remains **3,153 instances / 0 broken**.

## EXECUTION RECORD — Card assets repaired (2026-07-15)

The canonical Card sets had correct color-variant counts but had regressed to 150px palette swatches with repeated `Lorem ipsum`, 12px padding, 10px raw radius, unbound body text, forced external-link/check icons, and Boolean properties that controlled no layers. Repaired the existing published-key sets in place:

- `Card` `504:62`: 12 official variants, 320px official `CardShowcase` content, spacing-4 padding, radius-container, Heading/4 + Body, semantic text/background/border bindings.
- `ClickableCard` `504:141`: 13 official variants, official Settings showcase, forced link icons removed, `isDisabled` wired to a disabled veil on every variant.
- `SelectableCard` `504:233`: 13 official variants, official Pro-plan content at 180px, forced check icons removed, `isSelected` wired to the official accent-border treatment and `isDisabled` to a disabled veil.
- Removed empty construction frame `266:424`; reflowed `OFFICIAL_COMPONENTS / Card` and restored an 88px gap before Examples.

Separate readback, transient instance-state tests, and screenshots verified: 38/38 variants, 0 placeholder strings, correct state visibility (`disabled=true`, `selected=false`), no overlap. File-wide integrity is **3,127 instances / 0 broken**. The 26-instance decrease is expected: one non-official nested icon was removed from each ClickableCard and SelectableCard color variant.

Disabled-state correction after visual QA: source inspection confirmed both interactive cards use `opacity: 0.5`, not disappearance. The initial bound-paint veil was fully opaque because `setBoundVariableForPaint` normalized paint opacity to 1. Fixed all 26 disabled veils by binding `color/background/surface` and setting the veil layer opacity to 0.5. Side-by-side instance screenshot verified the disabled card remains clearly visible and faded. SelectableCard selection borders were also corrected to the official per-variant `color/border/<hue>` tokens with a 3px inset-equivalent ring.
