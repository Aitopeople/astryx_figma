# Independent Figma Verification Protocol

- Verification must be a separate Figma MCP read after editing; do not reuse the editor's in-memory assumptions.
- Load the mandatory Figma-use guidance for unique reads.
- Verify every approved operation against its `expected` and `verification.assertions` fields.
- For visual operations, screenshot the changed component and containing official frame. Verify crop/fit, bounds, clipping, z-order, visibility, and overflow.
- Verify component properties/variants, dependent instances, variables/styles, image fills/hashes where available, zero broken instances, zero active synthetic placeholders, and complete coverage.
- Record `passed: true|false` for every assertion. Missing evidence is failure, not success.
- Emit `figma-after.json` plus `operation-results.json`; then run `verify-run.mjs` to produce the final verdict.
- Do not repair failures in the verifier. A failure starts a new actual-state diff and approval cycle.
