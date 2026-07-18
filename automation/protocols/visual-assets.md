# Visual and asset verification

1. Store source bytes once by SHA-256; run manifests reference the content-addressed asset.
2. Record intrinsic and placed dimensions, fit/crop, clipping, radius, scrim, and token bindings separately.
3. Structural and semantic gates run before screenshots. A failed gate stops screenshot work.
4. Capture the containing frame first, reuse unchanged screenshot hashes, and prefer a contact sheet over many individual images.
5. Use 2x review for icon swaps, negative spacing, thin borders, clipping, scroll gutters, and z-order.
6. Machine/perceptual diff passes unchanged images; model review receives only changed or ambiguous crops.
7. Asset upload verification always checks hash, IMAGE fill, scale mode, clipping, intrinsic size, placed size, and zero placeholders.
