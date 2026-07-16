# Agent Automation Control Plane

Date: 2026-07-16
Baseline: Astryx 0.1.6
Figma file: `4YmLJEV002eWzvKLVQru5f`

## Implemented

- Added JSON-compatible YAML policy for library identity, exact package versions, batching, approval expiry, risk thresholds, approved exceptions, and asset host allowlisting.
- Added versioned schemas for official snapshots, Figma snapshots, plans, approvals, and verification.
- Added canonical JSON and SHA-256 hashing, fail-closed run transitions, schema enforcement, semantic diffing, deterministic plan generation, approval creation/validation, verification, report generation, and marked status synchronization.
- Added coordinator, reader, constrained editor, and independent verifier contracts for Figma MCP sessions.
- Added asset reference extraction, rendered placement hints, original-byte hashing and intrinsic dimension detection, expected fallback-404 classification, and SSRF protections.
- Added read-only GitHub Actions checks. CI never receives authority to write to Figma or publish a library.

## Approval Boundary

- Approval is bound to the canonical plan hash, Figma-before hash, Astryx version, operation IDs, high-risk acknowledgements, optional bulk-plan acknowledgement, and expiry.
- A changed package, plan, before-state, scope, or expired receipt stops execution.
- The Figma editor may execute only validated operation IDs. Newly discovered work starts a new diff/plan/approval cycle.
- Team-library publishing remains manual.

## Verification Evidence

- Unit/integration tests: 13 passed.
- JavaScript syntax check: all automation `.mjs` files passed `node --check`.
- Static status check: README/checkpoint markers match exact Astryx 0.1.6.
- Dependency audit: 0 known vulnerabilities across 120 dependencies.
- Full official-source dry run: 149 components, 43 page templates, 584 block templates; 627 total templates collected.
- Full source scan found 164 media references before URL filtering; the corrected extractor admits only image-extension media references.
- Asset smoke run: seven unique live URLs fetched successfully; official Avatar fallback-test 404 URLs were classified as expected unavailable sources; no unexpected failures.
- Figma MCP read-only smoke check: 81 pages, five variable collections, 134 variables, 14 text styles, and eight effect styles; no Figma mutation was performed.

## Remaining Pilot

The framework is complete, but the first live automated write intentionally has not been fabricated. The next run must collect a complete normalized `figma-before.json`, generate a real plan, present its hash for approval, then apply a small documentation-only operation set before progressing to asset/property changes.
