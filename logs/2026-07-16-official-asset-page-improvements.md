# Official Asset Page Improvements

Date: 2026-07-16
Baseline: Astryx 0.1.6
Figma file: `4YmLJEV002eWzvKLVQru5f`

## Audit

Scanned all pages containing `OFFICIAL_COMPONENTS /` frames for:

- synthetic media placeholders and generic image geometry;
- component sets with very small or non-representative previews;
- missing image fills for media-oriented components;
- gaps between official props/examples and Figma component properties;
- frame overflow and broken instances.

The highest-confidence asset problems were on Avatar, Thumbnail, Lightbox, Overlay, and Utilities / MediaTheme.

## Improvements

### Avatar

- Replaced the gradient-ring photo placeholder at all five named sizes with the official `DATA-Ana-Thomas.png` asset.
- Replaced AvatarGroup color circles with official Ana Thomas, Drew Young, and Jihoo Song images.
- Preserved the initials and default-icon fallback states and existing status slot.

### Thumbnail

- Rebuilt the public component in place from 72x78 “IMG + filename” to the official 64x64 square media format.
- Removed the incorrect visible filename caption.
- Added real image content and prop-driven `isLoading`, `isDisabled`, `onRemove`, `Label`, and `alt` controls.
- Added documented loading, disabled, and remove overlays without changing the existing component ID.

### Lightbox

- Rebuilt the 160x110 gray placeholder as a 640x420 media viewer.
- Added official landscape media, caption, gallery index, previous/next controls, close control, and optional zoom.
- Added `isOpen`, `caption`, and `media` component properties; media is an instance-swap slot using official Astryx assets.

### Overlay

- Expanded the three gray placeholders into a nine-variant `position × scrim` matrix.
- Exact axes: position `fill | bottom | top`; scrim `dark | light | false`.
- Added official media-backed children, reusable Button content, `children` and `content` instance swaps, and existing `isOpen` behavior.
- Set each representative surface to the official playground size of 320x180.

### MediaTheme

- Rebuilt the tiny dark/light swatches as the official 360x230 image-surface context.
- Added image, dark/light scrims, title, badge, supporting text, and primary/secondary/ghost button treatments.
- Preserved the exact required `mode=dark | light` variants.
- Documented that the background is an example surface; MediaTheme itself does not add a background.

## Verification

- Final library integrity: 81 pages, 424 components, 60 component sets.
- Instances: 665; broken instances: 0.
- Active Figma placeholders: 0.
- No child overflow in the five changed official component frames.
- Screenshot QA passed for Avatar, Thumbnail, Lightbox, Overlay, and Utilities / MediaTheme.
