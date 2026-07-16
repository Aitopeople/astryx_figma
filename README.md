# Astryx Design System Figma Mirror

This repository contains the working notes and agent instructions for mirroring the Astryx design system library into Figma and keeping that Figma file aligned with the official documentation.

<img src="Cover.png" alt="Astryx design system cover" width="100%" />

## Status

<!-- AUTOMATION:STATUS:START -->
- Verified baseline: **Astryx v0.1.6** (exact core + CLI match).
- Official inventory: 149 components, 43 page templates, 584 block templates.
- Figma integrity: 81 pages, 424 components, 60 component sets, 0 broken instances.
- Latest verified state is summarized in `checkpoint.md`; Figma team-library publishing remains manual.
<!-- AUTOMATION:STATUS:END -->

## Figma

View the public Figma Community file:

[Astryx Design System on Figma Community](https://www.figma.com/community/file/1655939158795671259)

## Document Roles

### `advise.md`

Practical guidance for the Figma mirror work. It defines the core rule: use the official Astryx documentation as the source of truth, and do not invent components, examples, variants, or descriptions.

Main contents:

- Accepted official sources, with preserved crawls treated only as version-matched fallback evidence
- How to use Astryx MCP, the Astryx CLI, the official website, and Figma MCP together
- The fast **text/token-diff audit method** (compare Figma preview text against the crawl card text) — preferred over screenshotting every frame
- The two known **drift classes**: placeholder example content in structural/layout sets, and paraphrased captions on aggregate pages
- Official page structure (Usage / Best practices / Examples) and the Figma file naming conventions
- Failure modes and `use_figma` gotchas found during earlier work
- Verification steps to follow before and after writing to Figma

### `AGENTS.md`

Project-specific instructions for AI coding agents such as Codex. It explains how to use the Astryx CLI, how to discover components before using them, and which styling and token rules must be followed.

The main idea is: do not guess. Check the Astryx CLI and documentation first.

### `.claude/CLAUDE.md`

Claude-specific project instructions. Its contents are almost the same as `AGENTS.md`, so Claude follows the same Astryx workflow rules in this repository.

### `checkpoint.md`

A short handoff file for resuming work. It keeps only the current status, current risks, immediate next actions, and links to detailed logs.

Read `checkpoint.md` before starting new work. It is intentionally compact so agents do not spend unnecessary context on old audit history.

### `logs/`

Archived audit notes and detailed findings. Long historical records, component-by-component checks, and past discrepancy reports should live here instead of making `checkpoint.md` larger over time.

## How the Figma Migration Works

The goal is not to create a design system that merely looks similar to Astryx. The goal is to mirror the official Astryx documentation in Figma as accurately as possible.

The workflow is roughly:

1. Check the official Astryx documentation structure.

   Use `npx astryx component --list`, `npx astryx search "<query>"`, Astryx MCP `search`, and the official website to identify the real official components and page groupings.

2. Collect official metadata for each component.

   Use `npx astryx component <Name> --json` or Astryx MCP `get` to collect prop names, types, default values, descriptions, and examples. MCP output can be incomplete, so the visible Examples section on the official website must also be checked.

3. Align the Figma page structure with the official docs.

   Figma page names, groups, and sections should match the official Astryx documentation navigation. Do not merge unrelated official pages or split official groups arbitrarily.

4. Build the component documentation and examples in Figma.

   Each component page should include the official prop table, the Usage import block, the Best-practices Do/Don't table (where the official page has one), descriptions, and official examples. Examples should be represented as they appear in the official docs — exact titles, captions, item counts, and values — not replaced with simplified or approximated samples.

5. Write through Figma MCP, then read back to verify.

   After creating or modifying nodes in Figma, perform a separate read step to confirm the changes were applied. Text/token diffs cover content drift; every image, crop/fit, scrim, layout, and component-property visual change also requires screenshot verification. Existing Figma content is never treated as proof of the official source.

6. Record discrepancies and next steps in `checkpoint.md`.

   If MCP and the website disagree, or if the Figma file still has structural issues, record the short current status in `checkpoint.md`. Put long audit details in a dated file under `logs/` and link to it from `checkpoint.md`.

In short, the process collects component information from the Astryx CLI and official documentation, updates the Figma file through Figma MCP, and verifies the result against the official docs. The official Astryx documentation is always the source of truth; existing Figma content and agent assumptions are not.

## Approved Agent Automation

The control plane lives under `automation/`. Local scripts collect and normalize evidence, create a deterministic plan, hash the plan, validate human approval, and verify the result. Figma MCP access remains with the coordinator/editor/verifier agents defined in `automation/prompts/`.

Typical run:

```powershell
npm run library:state -- init --run automation/runs/<run-id>
npm run library:collect -- --run <run-id>
npm run library:normalize-figma -- --input <raw-figma-read.json> --output automation/runs/<run-id>/figma-before.json
npm run library:diff -- --official automation/runs/<run-id>/official.json --figma automation/runs/<run-id>/figma-before.json --run automation/runs/<run-id>
npm run library:plan -- --diff automation/runs/<run-id>/diff.json --run automation/runs/<run-id>
npm run library:approve -- --run automation/runs/<run-id> --approver <name> --operations all
npm run library:validate -- --run automation/runs/<run-id> --figma-before automation/runs/<run-id>/figma-before.json
```

High-risk operations require their IDs through `--ack-high-risk`; bulk plans additionally require `--ack-bulk <planHash>`. These acknowledgements are intentionally not inferred from `--operations all`.

After approval validation, the MCP-capable coordinator automatically continues with only the approved operation IDs. It then performs a separate readback and screenshot verification. Figma library publishing is never automated.
