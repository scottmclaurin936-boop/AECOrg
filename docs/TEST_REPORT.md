# AEC local draft QA — October 19, 2026

## Results (executed locally)

- `python scripts/check_site.py` — **PASS**: 12 HTML pages; local links; one page heading/main per page; skip links; `noindex`; independent `.org` and `.com` pages; empty approved-assets manifest; Peak Irony not integrated.
- `python scripts/validate_content.py` — **PASS**: one example draft record; no public entries; no approved media; no approved publication state.
- `python scripts/browser_smoke.py` — **PASS**: 32 isolated Chromium page/viewport combinations across 360, 390, 768, and 1280 px; no horizontal overflow or JS errors; responsive menus and Escape closing; category filter, text search, and empty-result state.
- New screenshots: `previews/org-projects-390px.png`, `previews/com-workflow-390px.png`. Five previous screenshots were regenerated from current code by the smoke script.

## Not tested / not claimed

- No live hosting, authentication, DNS, payment, inquiry, or CMS integration.
- Isolated Chromium render uses inlined CSS and JS, not a production HTTP server.
- The latest approved Grok handoff was not provided to this run, so no design/source comparison was possible.
- Read-only Vercel `list_projects` for team slug `scott` returned **403 forbidden** on October 19, 2026. CLI fallback could not run because the `vercel` CLI is not installed in the environment. No live project was changed.
- A schema and local guardrail validator do **not** implement an authenticated publishing workflow.

**Release gate:** Founder review and explicit authorization are required before deployment, DNS changes, public copy, media, or cross-project integration.
