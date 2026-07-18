# Lightbox Video official default-state rebuild

- Astryx source: `npx astryx template LightboxVideo --json`, version `0.1.6`.
- Approved plan: `070863e2a0cece6cd0963b500b3dc848e40e9d3e01db2b7da63b9787ee999e72`.
- Preserved `EXAMPLE / Lightbox — Video` (`217:78`) and implementation frame (`217:69`).
- Removed the invented open-lightbox mock: dark background, top and bottom bars, filename, Close label, and native-controls copy.
- Mirrored the official initial runtime state (`isOpen=false`) with one centered default secondary `md` Button labelled `Play video`.
- Bound surface, neutral, text, element height, inline spacing, radius, font size, weight, and family to existing Astryx variables.
- Deliberately added no poster or raster: the official video portal is closed initially.
- Independent verification: centered delta `(0, 0)`, obsolete text 0, image fills 0, broken instances 0, active placeholders 0.
- Screenshot: `automation/runs/2026-07-17-lightbox-video-official-default-state/screenshots/lightbox-video.png`.
