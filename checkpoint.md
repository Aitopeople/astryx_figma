# Astryx Figma Mirror Checkpoint

Last updated: 2026-07-12

This file is intentionally short. It is the first file to read when resuming work. Detailed audit history lives in `logs/`.

## Agent Start Here

- The Figma file must mirror the official Astryx documentation exactly.
- Read `advise.md` for workflow rules, source priority, the fast text/token-diff audit method, the two drift classes, Figma naming conventions, and use_figma gotchas.
- Do not trust existing Figma text, Figma component properties, or agent-written summaries as official source material.
- Official sources, in priority: Astryx MCP → `npx astryx` (CLI) → official website. The website is a client-rendered SPA (WebFetch returns only the shell); the **preserved crawl** (`…/e4e5532f…/scratchpad/pages/<Comp>.json` card `text`, `afterExamples` flag, `shots/`) is the practical authoritative source. Re-crawl if that temp dir is gone.
- After writing to Figma, read the file back and verify.
- Record only current status and next actions here; put long findings in `logs/`.

## Current Status

- Figma file: `astryx_design_system` (fileKey `4YmLJEV002eWzvKLVQru5f`)
- Verified baseline: Astryx `v0.1.4` (`@astryxdesign/core` + `@astryxdesign/cli` `^0.1.4`; the bare `astryx` npm pkg is an unrelated 0.0.0 placeholder). Version strings synced in `.claude/CLAUDE.md`, `AGENTS.md`, `advise.md`.
- 74 component group pages; props `1425/1425`; example cards `408/408`; 0 blocking mismatches; 0 broken/missing-main instances (last full sweep ~3,090 instances).
- Every component page carries Usage(import) + Best-practices where official, plus official examples.
- Known exception: `CircularProgress` has a live URL but is absent from the v0.1.4 sidebar → docs-only, no box, by design.
- Figma Code Connect metadata blocked by Figma seat permissions.

## Current Working Rules

- Do not invent components, subcomponents, helper components, documentation sections, variants, examples, or descriptions.
- Preserve official docs grouping and page names; don't merge/split official groupings arbitrarily.
- Every component page: official props + Usage + Best-practices (where official) + official examples.
- The hero (crawl card 0, `afterExamples:false`) is NOT an example — don't promote it unless the user asks.
- Only mark an example absent after checking MCP, rendered website / crawl `afterExamples` cards, and showcase metadata.

## Known High-Risk Areas

- Page grouping drifting into invented categories.
- MCP `get` omitting examples shown on the website; raw HTML missing client-rendered Examples.
- Existing Figma content containing construction artifacts / agent-written text.
- **Drift class 1 — example CONTENT placeholders** in structural/layout/disclosure/overlay sets (counts, values, labels wrong).
- **Drift class 2 — paraphrased CAPTIONS** on aggregate pages (Chat/Navigation).
  Content/data components copy official data faithfully; audit them last.

## Completed Work (details in the log)

All rounds recorded in `logs/2026-07-07-round4-visual-verification.md`:

- **R4** — screenshot re-verification of every example page; 21 pages rebuilt to official.
- **R5–R6** — OFFICIAL_COMPONENTS reps fixed (placeholders/doc-cards → clean insertable components); set membership verified vs CLI.
- **R9** — icon replacement (~480 text-glyph / hand-drawn icons → MDI instances).
- **R11** — 🧩 Templates page: all 40 official page templates at 1440×1024, cross-checked vs each `page.tsx`.
- **R12** — upgrade to v0.1.4 + consistency check (no mirror changes required).
- **R13–R14** — Usage-code + Best-practices rollout to all 71 single-component pages + 36 aggregate subcomponents. AlertDialog — Delete added (hero content, per user decision).
- **R15** — full example-content audit via text/token-diff vs crawl. **67 fixes**: 32 example-content rebuilds (AspectRatio, Grid ×4, MetadataList ×3, Layout ×4, Collapsible ×4, Dialog ×4, CommandPalette ×4, Pagination ×2, Kbd ×2, + isolated captions) + 35 aggregate caption corrections (Navigation ×21, Chat ×14). ~340 remaining previews verified clean.

Minor unfixed cosmetic nits (no fidelity impact): Table—Inline Filters filter-chrome; Switch—With Status "·"vs"∙" bullet; Blockquote cite "— " prefix (likely CSS in official); ChatToolCalls—Expandable omits a "cli:remote-server" label.

## Next Work

- Full audit complete as of 2026-07-12. No open drift.
- If the site/package version bumps past 0.1.4, rerun the audit (advise.md workflow) before claiming full sync.
- Before changing any page, re-check that component's official metadata/examples first.
- New long audit → new dated file under `logs/`, linked here. Keep this checkpoint short.

## Detailed Logs

- Current audit history (R4–R15): `logs/2026-07-07-round4-visual-verification.md`
- Full archived audit and historical checkpoint: `logs/2026-07-06-full-audit-checkpoint.md`
