# Run efficiency

1. Reuse exact-version official and asset caches; run artifacts should be small hash references.
2. Use scoped target + dependency readback merged with the latest verified baseline. Full reads are for version bumps, foundations/public identity, bulk changes, publish readiness, and scheduled audits.
3. Query exact node IDs from the snapshot; avoid repeated page-wide `findAll` calls.
4. Aggregate first: return counts, digests, and bounded failures. Fetch detailed records only when counts fail.
5. One component set is one transaction; avoid per-variant MCP round trips.
6. Run structure → semantics → screenshot in that order.
7. Record `efficiency.json` with cache hits, bytes, scope, screenshots, and budget warnings.
