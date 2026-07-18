# Component production

1. Preserve public component-set IDs, keys, property definitions, and dependent instances when rebuilding in place.
2. Treat the approved component set and its complete variant Cartesian product as one transaction.
3. Model finite official unions as variants; meaningful omitted states are documented, not invented.
4. Wire TEXT/BOOLEAN/INSTANCE_SWAP properties immediately and verify reference coverage across every applicable variant.
5. Official examples must retain lineage to public components or source-backed compositions; detached lookalikes fail.
6. Run capability preflight before writing. Do not use variant-specific defaults for one exposed nested INSTANCE_SWAP, manual child coordinates in Auto Layout, or rotated substitute icons.
7. Return compact root-level mutation summaries and counts. Return leaf IDs only for rollback or targeted failure diagnosis.
8. Verify all variants structurally before visual QA.
