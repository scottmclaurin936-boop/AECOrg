# AEC October 20 QA report

## Executed checks

- `python scripts/check_site.py` — **PASS**. Checked 18 HTML pages for titles, main headings, local links, accessible skip target, viewport metadata, `noindex`, and surface separation. All page-map entries exist. Peak Irony is not integrated; no quarantined design code is referenced.
- `python scripts/validate_content.py` — **PASS**. One draft project record validated; no public-approved records or approved assets in the independent draft.
- `python scripts/qa_oct20_quick.py` — **PASS**. Eight representative pages at 390px and 1280px (16 browser/viewport checks) in isolated Chromium rendering. No horizontal overflow or JavaScript exceptions; mobile and desktop navigation tested.
- Interactive form previews — **PASS**. Application and production brief render local-only summaries, not submission receipts.
- Settings export — **PASS**. Edited headline appears in exported JSON, while application-and-approval remains selected and public signup/deployment flags remain false.
- New screenshots were captured in `previews/new-*.png` for visual review.

## Not verified

- Full page-by-page screenshot regression across all 18 pages, 360px and tablet widths, real network routing, server-side security, real CMS behavior, production form delivery, authentication, domain configuration, or current approved live baseline.
- The automated browser environment blocked direct `file://` navigation, so browser QA used HTML with shared CSS and JS inlined via `page.set_content`. This validates rendering and local behavior but not file routing or hosted deployment.
- `noindex,nofollow` prevents indexing requests but does not provide privacy or authentication.

## Publication state

**No deployment or external hosting attempted.** Review-only artifacts must be reconciled with the latest approved source and authorized by the founder before integration.
