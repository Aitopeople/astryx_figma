# Astryx Figma Mirror Checkpoint

Last updated: 2026-07-07

This file is intentionally short. It is the first file to read when resuming work. Detailed audit history lives in `logs/`.

## Agent Start Here

- The Figma file must mirror the official Astryx documentation exactly.
- Use `advise.md` for workflow rules, source priority, and known failure modes.
- Do not trust existing Figma text, Figma component properties, or agent-written summaries as official source material.
- Use official Astryx sources first: Astryx MCP, `npx astryx`, and the official website.
- Check the official website Examples section before deciding which examples belong in Figma.
- After writing to Figma, read the file back and verify the changes.
- Record only current status and next actions here; move long findings and historical notes into `logs/`.

## Current Status

- Figma file name: `astryx_design_system`
- Last reviewed node context: `50:2`
- Current verified baseline in `advise.md`: Astryx `v0.1.3`
- Earlier package baseline in archived audit: `@astryxdesign/core` `0.1.2`, `@astryxdesign/cli` `0.1.2`
- Astryx MCP endpoint was reachable by direct JSON-RPC in the archived audit.
- Figma MCP was used for inspection and writes in the archived audit.
- Figma Code Connect metadata was blocked by Figma seat permissions.

## Current Working Rules

- Do not invent components, subcomponents, helper components, documentation sections, variants, examples, or descriptions.
- Preserve official docs grouping and page names.
- Do not merge unrelated official docs pages into broad Figma pages.
- Do not split official grouped docs into arbitrary separate pages.
- Every component page should include official props and official examples where available.
- For examples, use the union of visible official website examples and official showcase metadata.
- Only mark examples as absent after checking MCP, visible website content, and raw page payload/showcase metadata.

## Known High-Risk Areas

- Page grouping can drift into invented categories instead of official docs navigation.
- Astryx MCP `get` can omit examples that appear on the official website.
- Raw HTML extraction can miss client-rendered Examples content.
- Existing Figma content can contain construction artifacts or agent-written text that should not be treated as official.

Known discrepancy patterns from archived work:

- `Badge`: MCP did not return every official webpage example.
- `TextArea`: MCP did not expose the complete official webpage examples.
- `TextInput`: should be rechecked against the official webpage.
- `Navigation`: simple text extraction missed official showcase metadata.

## Next Work

- Continue using the official Astryx docs as the source of truth.
- Before changing any component page, re-check that component's official metadata and website examples.
- If a new long audit is needed, create a dated file under `logs/` and link it from this checkpoint.
- Keep this checkpoint focused on current status, current risks, and immediate next actions.

## Detailed Logs

- Full archived audit and historical checkpoint: `logs/2026-07-06-full-audit-checkpoint.md`
