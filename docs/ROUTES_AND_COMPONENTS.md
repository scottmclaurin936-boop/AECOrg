# Route map / components — October 20, 2026

## Academy / .org (10 pages)
Home, About, Creators, Member #001, Projects, Project Record, Initiatives, Membership, Application Preview, Site Map.

## Production / .com (6 pages)
Home, Portfolio, Production Record, Workflow, Production Inquiry Preview, Site Map.

## Shared components
`shared/style.css`: responsive header/nav, 44px touch targets, cards, forms, grid, skip link, contrast and reduced-motion support.
`shared/app.js`: mobile menu handling, project search/filter, non-submitting sample summaries.
`shared/review-controls.js`: editable draft-copy preview and JSON download; does not change the site.
`content/site-config.json`: proposed settings with explicit publication and enrollment gates.
`content/page-map.json`: complete inventory and Peak Irony boundary.

## Deployment boundaries
The .org and .com concepts live in separate folders with no cross-surface links. They can be split into distinct hosting projects. Root review tools are **local-only** and should never be included in a public deployment. There is no Peak Irony source tree or redirect in this package.

## Accessibility / QA
Use keyboard navigation, confirm focus styles and mobile menu operation, inspect form summaries with a screen reader, and test at 360, 390, 768, and 1280px before any protected preview. See `docs/TEST_REPORT_2026-10-20.md` for actual executed checks.
