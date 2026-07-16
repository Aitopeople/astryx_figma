# Figma Library Agent Automation Plan

Date: 2026-07-16
Status: Implemented — control plane verified; first approved live-write pilot remains pending

## Requirements Summary

- Detect Astryx package/docs changes and collect a versioned official snapshot automatically.
- Inspect the current Figma library through Figma MCP and produce a normalized, read-only snapshot before any write.
- Generate a reviewable, machine-readable change plan with exact evidence, target node IDs, risk, and verification assertions.
- Execute Figma MCP writes automatically only after a human approves the exact plan artifact.
- Reject execution if the plan changes after approval, the approval expires, the source baseline changes, or the Figma preconditions no longer match.
- Verify writes in a separate MCP read and screenshot pass, as already required by `advise.md:59-62` and `advise.md:371-382`.
- Keep Figma library publishing manual, matching the current operational constraint in `checkpoint.md:23`.
- Preserve existing Astryx source-of-truth, asset, property, token, and private-helper rules in `advise.md:18-62` and `advise.md:290-301`.

## Architectural Decision

Use a hybrid orchestrator:

- Deterministic Node scripts own schemas, official-source collection, normalization, diffing, plan hashing, approval validation, report generation, and tests.
- An MCP-capable coordinator agent owns Figma reads, approved writes, asset uploads, screenshots, and readback verification.
- The coordinator may only apply operations serialized in an approved `plan.json`; free-form Figma mutation during an automated run is forbidden.

This avoids incorrectly assuming that a local Node process can directly invoke the session-scoped Figma MCP while still making the workflow resumable and auditable.

## Proposed Repository Structure

```text
automation/
  config/
    library.yaml
    exceptions.yaml
    risk-rules.yaml
  schemas/
    official.schema.json
    figma.schema.json
    change-plan.schema.json
    approval.schema.json
    verification.schema.json
  scripts/
    collect-official.mjs
    normalize-figma-snapshot.mjs
    diff-library.mjs
    build-change-plan.mjs
    approve-run.mjs
    validate-approval.mjs
    render-report.mjs
    update-docs.mjs
  lib/
    canonical-json.mjs
    hashing.mjs
    policy.mjs
    state-machine.mjs
  prompts/
    coordinator.md
    figma-reader.md
    figma-editor.md
    verifier.md
  tests/
    fixtures/
    schemas.test.mjs
    diff-library.test.mjs
    approval-gate.test.mjs
    policy.test.mjs
  runs/
    .gitkeep
```

Generated run data lives under `automation/runs/<run-id>/`. Large screenshots and downloaded source assets should be ignored by Git; compact manifests, approved plans, verification summaries, and final reports may be retained when they are release evidence.

## Run Artifact Contract

Each run uses an immutable run directory:

```text
automation/runs/<run-id>/
  run.json
  official.json
  figma-before.json
  diff.json
  plan.json
  approval.json
  figma-after.json
  verification.json
  report.md
  assets/
  screenshots/
```

`run.json` follows this state machine:

```text
COLLECTING -> PLANNED -> AWAITING_APPROVAL -> APPROVED
-> APPLYING -> VERIFYING -> VERIFIED
                         \-> FAILED
```

No transition may skip `AWAITING_APPROVAL`, `APPROVED`, or `VERIFYING`. A failed write or verification result stops the run; automatic rollback is not assumed because arbitrary Figma structural changes are not reliably reversible through MCP.

## Plan and Approval Contract

`plan.json` must include:

- run ID and Astryx source version;
- Figma file key and `figma-before.json` hash;
- canonical plan hash;
- official evidence for every operation;
- operation type, exact target page/node ID, and preconditions;
- expected property, token, asset, bounds, or text result;
- risk class and whether screenshot verification is required;
- list of affected components and dependent instances;
- explicit representation gaps and approved exceptions.

`approval.json` must include:

- exact canonical `planHash`;
- approver identity or local operator label;
- approval timestamp and expiry;
- approved operation IDs or `all`;
- acknowledged high-risk operations;
- `figmaBeforeHash` and Astryx version.

Before the first Figma write, `validate-approval.mjs` must prove that all hashes, versions, scopes, expiry, and preconditions still match. Any mismatch returns the run to `AWAITING_APPROVAL`; it must never silently regenerate and apply a changed plan.

## Risk Policy

### Low risk — may run immediately after plan approval

- version labels and source notes;
- exact official descriptions, captions, imports, and prop-table rows;
- additive examples with verified parent and source;
- README/checkpoint regeneration from verified manifests.

### Medium risk — approval plus targeted screenshot verification

- asset replacement and crop/fit/scrim changes;
- component property or `INSTANCE_SWAP` wiring;
- variant additions that map to finite official prop unions;
- auto-layout, bounds, clipping, or overlay reconstruction;
- token/style binding changes.

### High risk — approval must explicitly acknowledge each operation

- deleting or renaming public components/pages;
- replacing a stable component ID;
- removing variants or component properties;
- bulk operations affecting more than a configurable component/node threshold;
- changes that may break published downstream instances.

### Never automated

- Figma team-library publishing;
- deleting user-approved exceptions without a separate decision;
- inventing public components, props, variants, examples, or tokens;
- proceeding when source evidence conflicts or is incomplete.

## Implementation Steps

### 1. Establish configuration, schemas, and canonical hashing

Create the proposed `automation/config`, `schemas`, and `lib` files. `library.yaml` holds the Figma file key currently recorded in `checkpoint.md:9`, the exact package policy currently represented in `package.json:5-9`, batching limits, approval expiry, and high-risk thresholds. `exceptions.yaml` migrates the intentional exceptions at `checkpoint.md:25-28` into structured entries with owner, rationale, evidence, scope, and optional expiry.

Acceptance checks:

- Every JSON artifact validates against a versioned schema.
- Semantically identical JSON yields the same SHA-256 canonical hash regardless of object key order.
- Unknown schema versions and unknown operation types fail closed.

### 2. Build the official-source collector

Implement `collect-official.mjs` using the installed local CLI entry instead of relying on the Windows `npx` wrapper. Collect package/CLI versions, component registry, props, related templates, template source, docs topics, tokens, and asset references. Treat docs MCP/browser evidence as an agent-supplied supplemental input because the local script cannot assume session MCP access. Preserve source type, source version, command/resource, and retrieval timestamp on every record.

This formalizes the multi-source rules at `advise.md:34-57` and the current package entry at `package.json:3`.

Acceptance checks:

- A clean v0.1.6 run reports 149 components, 43 page templates, and 584 block templates, matching `checkpoint.md:10-12`.
- A stale or versionless crawl cannot satisfy current-version evidence.
- Template license headers are normalized out only for example-body comparison.
- Asset records distinguish source URL/hash, intrinsic size, rendered size, fit, crop, radius, shape, and scrim.

### 3. Define the Figma read protocol and normalized snapshot

Create `prompts/figma-reader.md` and `normalize-figma-snapshot.mjs`. The reader performs bounded, read-only Figma MCP batches and records pages, local components, component sets, variables, styles, properties, instances, image fills, layout/bounds, clipping, and official taxonomy. The normalizer rejects missing node IDs, duplicate public identities, and partial batches.

Acceptance checks:

- The initial snapshot reproduces the current integrity counts in `checkpoint.md:13-15`, or reports each difference rather than overwriting the baseline.
- Reads never change the active Figma document.
- Each batch records coverage so interrupted collection can resume without being mistaken for a complete snapshot.

### 4. Implement semantic diffing and policy classification

Build `diff-library.mjs` and `policy.mjs`. Compare official and Figma records by stable identity, not display order. Produce `missing`, `extra`, `changed`, `conflicting`, `exception`, and `unverifiable` results. Apply the prop/variant/slot and asset rules from `AGENTS.md:69-82` rather than treating all value differences as equivalent.

Acceptance checks:

- Optional omitted props do not create invented `none`/`unset` fixes.
- Runtime callbacks are documentation differences, not visual variant operations.
- Asset equality requires the expected image hash/fill plus placement behavior; matching labels alone is insufficient.
- Approved exceptions appear as `exception`, not clean matches or actionable drift.
- Conflicting or unverifiable evidence cannot produce an executable operation.

### 5. Generate a deterministic, reviewable change plan

Implement `build-change-plan.mjs`. Group operations into bounded Figma batches, attach evidence and preconditions, calculate impact/risk, and define readback plus screenshot assertions. Preserve component IDs wherever possible, following `advise.md:294-300`.

Acceptance checks:

- Re-running against identical snapshots produces byte-identical canonical plan content and the same hash.
- Every operation has at least one official evidence reference, target identity, precondition, expected result, and verification assertion.
- High-risk operations are listed separately and never hidden inside a bulk operation.
- The generated Markdown review summarizes the exact JSON plan without adding executable operations.

### 6. Add the human approval gate

Implement `approve-run.mjs` and `validate-approval.mjs`. Approval occurs against the displayed plan hash. Chat approval may instruct the coordinator to create the receipt, but the receipt—not conversational memory—is the durable execution authority.

Acceptance checks:

- Editing one byte of canonical plan content invalidates approval.
- Changing the official version, Figma-before hash, expiry, or operation scope invalidates approval.
- Partial approval executes only the named operation IDs and produces a new derived plan hash if batching changes.
- High-risk operations require explicit IDs in the approval receipt.

### 7. Implement the constrained Figma editor agent

Create `prompts/figma-editor.md` and update project agent instructions to require it for automated runs. The editor loads the mandatory Figma skills, validates approval, resolves exact target nodes, uploads assets through `upload_assets`, applies one bounded batch, and returns mutated IDs. It may not discover new work or alter the plan while writing.

Acceptance checks:

- No MCP write occurs without a valid approval receipt.
- All writes target IDs or preconditions present in the plan.
- A precondition mismatch stops before the affected batch.
- Asset, property, layout, and stable-ID rules in `advise.md:290-301` are enforced.
- The editor writes a machine-readable operation result for every attempted operation.

### 8. Implement independent verification and failure handling

Create `prompts/verifier.md` and `verification.schema.json`. Verification must occur in a separate Figma MCP read after all writes, with screenshots for every asset/property/layout change. Compare `figma-after.json` to the plan’s expected postconditions and global invariants.

Acceptance checks:

- Zero broken instances and zero active synthetic placeholders are required for success.
- Every changed asset verifies fill/hash where available, scale mode, crop/fit, bounds, clipping, and z-order.
- Every changed component verifies official properties, variant values, dependent-instance health, and containing-frame overflow.
- Failed assertions set the run to `FAILED`, record repair guidance, and never claim sync.
- Repairs require a new diff/plan/hash/approval cycle unless they are a retry of the identical approved operation after a transient MCP failure.

### 9. Generate documentation and release evidence from verified state

Implement `render-report.mjs` and `update-docs.mjs`. Only a `VERIFIED` run may update mutable status sections in `README.md` and `checkpoint.md`. This removes the current split where `checkpoint.md:10` says v0.1.6 while `README.md:9-13` still describes v0.1.4 and stale audit counts.

Acceptance checks:

- README/checkpoint status is derived from the same verified manifest and run ID.
- Historical detail is written to a dated `logs/` report and linked from checkpoint.
- Manual publish remains an explicit next action, consistent with `checkpoint.md:23` and `checkpoint.md:32-33`.
- Generated sections carry markers so hand-written guidance is not overwritten.

### 10. Add commands, CI checks, and a dry-run rollout

Add package scripts for `library:collect`, `library:diff`, `library:plan`, `library:approve`, `library:validate`, `library:report`, and `library:test`. CI should run schema, fixture, determinism, approval-gate, and stale-document checks; it must not mutate Figma. Execute the first live rollout in dry-run mode against v0.1.6, approve a small low-risk documentation-only batch, then test one medium-risk asset/property batch before enabling broader automation.

Acceptance checks:

- `npm run library:test` passes without external MCP access.
- CI detects the existing stale README status until it is regenerated from a verified run.
- Dry-run produces no Figma writes and yields a complete plan/approval preview.
- The pilot approved run passes independent verification and leaves library publishing manual.

## Verification Strategy

### Unit

- JSON schema validation and schema migrations.
- Canonical JSON and SHA-256 hashing.
- Risk classification and exception matching.
- Approval expiry, scope, hash, and precondition validation.
- Diff behavior for omitted props, callbacks, slots, assets, variants, and tokens.

### Integration

- CLI fixture collection for one simple component, AspectRatio, Avatar, Overlay, and a page template.
- Official snapshot plus synthetic Figma-before fixture produces the expected deterministic plan.
- Approved plan plus synthetic operation results produces the expected verification verdict.
- Interrupted Figma batch collection resumes without falsely claiming full coverage.

### End-to-end

- Dry-run full v0.1.6 audit with zero writes.
- Approved low-risk documentation update.
- Approved medium-risk asset/property update with upload, readback, and screenshot assertions.
- Deliberate precondition-change test proving execution stops after approval when Figma state changes.

### Observability

- Every run and operation has a stable ID, timestamps, state transitions, hashes, evidence, and MCP result summary.
- Reports show changed/skipped/failed operations and remaining drift.
- Secrets, signed upload URLs, raw credentials, and temporary asset endpoints are redacted from committed artifacts.

## Risks and Mitigations

- **Figma state changes after planning:** bind approval to `figma-before` hash and per-operation preconditions; stop on mismatch.
- **MCP output truncation or partial collection:** coverage manifests and resumable batches; incomplete coverage cannot produce an executable plan.
- **Source disagreement:** classify as `conflicting`; require human resolution rather than choosing a convenient source.
- **Plan says one thing while editor improvises:** editor accepts only serialized operation IDs and must report exact mutated node IDs.
- **Screenshot renderer artifacts:** retry a bounded capture once and retain structural readback; unresolved conflict fails verification.
- **Large destructive batch:** configurable thresholds plus explicit per-operation high-risk approval.
- **False rollback confidence:** no automatic structural rollback; stop, report, and generate a corrective plan from the new actual state.
- **Documentation drift:** generate mutable status blocks from the latest verified run and fail CI when checked-in output is stale.

## Completion Criteria

- A version change can move from collection to an actionable `plan.json` without manual data transcription.
- The user can approve the exact plan hash and the coordinator automatically continues into Figma MCP execution.
- No changed or expired plan can reuse an older approval.
- The executor cannot mutate targets outside approved operation IDs.
- Verification is separate from writing and checks all operation postconditions plus global library invariants.
- Failed verification cannot update the verified baseline or current-status documentation.
- Successful runs produce reproducible manifests, a dated report, synchronized README/checkpoint status, and a manual publish handoff.

## Initial Rollout Boundary

Phase 1 should automate collection, diff, planning, approval, and dry-run verification across the entire library. Live writes should then be enabled in this order:

1. exact documentation/status text;
2. prop rows and additive official examples;
3. one asset-bearing component batch;
4. component properties/variants/layout;
5. destructive or broad changes only after the first four lanes have stable run history.

Library publishing remains outside the automation boundary.
