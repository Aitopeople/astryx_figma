# Publishing

Publishing remains manual. Track four distinct states:

1. `VERIFIED_LOCAL` — approved writes and independent scoped/full verification passed.
2. `READY_TO_PUBLISH` — required full audit, release notes, stable IDs/keys, and publish-status inventory passed.
3. `PUBLISHED_MANUALLY` — a human published the intended changes and removed approved stale entries.
4. `CONSUMER_SMOKE_VERIFIED` — a consumer file refreshed the library, inserted a new instance, updated an existing instance, and found no stale entries.

Never report downstream completion from a local `UNPUBLISHED` component set.
