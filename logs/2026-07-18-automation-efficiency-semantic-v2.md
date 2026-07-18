# Automation Efficiency and Semantic Verification v2

Date: 2026-07-18

## Motivation

- Existing run artifacts totalled 73.05MB; byte-identical JSON/PNG groups accounted for 44.04MB of avoidable duplication.
- Thirteen full `official.json` files were byte-identical at about 2.43MB each.
- A full official collection executes roughly 779 CLI detail calls for 149 components and 627 templates even when the exact package/CLI version is unchanged.
- Small page/component fixes inherited full-library before/after reads and broad screenshot review.
- Previous verified representative examples did not prove public-variant coverage, property wiring, or example lineage.

## Implemented

- Added content-addressed JSON and asset storage with hash-verified run references.
- Added exact package/CLI/lock fingerprint reuse to `collect-official.mjs`; `enrich-assets.mjs` stores original bytes once by SHA-256.
- Added scoped Figma normalization that merges target/dependency reads with a verified complete baseline and emits page hashes, a foundation hash, and a Merkle root used by approval validation.
- Added source-backed component contracts for Selector and MultiSelector plus typed semantic checks for variant Cartesian coverage, property definitions/references, required/forbidden descendants, geometry, example lineage, and token binding.
- Added Figma capability preflight for known incompatible mechanics and required verification augmentations for instance swaps, negative spacing, and asset uploads.
- Added compact operation-result schema: root IDs, descendant counts, digest, bounded detail IDs, assertions, and warnings.
- Added staged visual planning: structural and semantic gates precede screenshots; unchanged hashes are reused; containing frames/contact sheets precede individual model-reviewed crops.
- Added run efficiency metrics and budgets for artifact bytes, references/cache hits, scoped/full mode, Figma calls, screenshot counts/reuse, and elapsed time.
- Added manual publishing lifecycle states: `VERIFIED` → `READY_TO_PUBLISH` → `PUBLISHED_MANUALLY` → `CONSUMER_SMOKE_VERIFIED`.
- Split frequently needed rules into focused protocols and changed `advise.md` into a routing entry point without deleting its historical reference material.

## Verification

- JavaScript syntax checks passed for every automation `.mjs` file.
- Test suite: 19 passed, 0 failed.
- Content-cache smoke test: first collection `cacheHit=false`; second identical collection `cacheHit=true`; run references were 400B and 399B.
- Existing Selector page data merged successfully with the 81-page baseline in scoped mode and produced Merkle root `dedfa057b8907820a15fd26d1b8dac47801552b04dd490075e0fee38101e26e3`.
- Semantic verification intentionally failed the legacy Selector snapshot because it did not contain variant records, property definitions/references, or complete binding evidence. Future target reads must follow reader v2; missing semantic evidence is no longer accepted as success.
- Existing full-quality plan passed capability preflight and collapsed eight visual operations into five containing-frame screenshot groups.
- Visual manifest smoke test reused the byte-identical screenshot and queued only the changed image for model review.

## Migration note

Old snapshots remain readable and valid for historical evidence. A new semantic operation cannot become `VERIFIED` without a target/dependency read containing the richer reader-v2 fields and a passing `semantic-verification.json`. Full-library recollection is not required for that migration; each touched page is upgraded incrementally.
