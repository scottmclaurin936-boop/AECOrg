# AEC blue-and-teal visual editor — verification

Date: October 22, 2026. **Not approved for publication**.

Verified locally:
- `python scripts/check_site.py`: PASS, 22 review HTML entry points, internal links and unpublished-content gates.
- `python scripts/check_oct22.py`: PASS, workbench validation and 16 Academy/production page baselines preserved except for one additional visual-editor script per page.
- `python scripts/validate_content.py`: PASS, no approved-public content/asset publishing.
- `node scripts/test_project_workbench.js`: PASS, local workbench validation.
- `python scripts/browser_smoke.py`: PASS, 32 responsive page-width combinations with no JavaScript errors or overflow.

The editor supports changing text, images, section visibility/order, link/alt attributes and theme accent. Its edits save **only in the active browser's localStorage** with manual JSON import/export. This is not authenticated, durable across devices, or capable of publishing to GitHub or Vercel. The site's real owner-only CMS, secure uploaded assets, versioning and publication flow remain unfinished. Do not deploy an editing mode publicly.
