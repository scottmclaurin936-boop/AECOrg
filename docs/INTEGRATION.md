# Technical integration map

## Separation of concerns
| Surface | Intended responsibility | Routing in this package |
|---|---|---|
| Academy `.org` | Public umbrella, founder story, Academy information, approved member showcases | `/`, `/about`, `/member-001`, `/projects` (prototype `.html` routes) |
| Commercial `.com` | Distinct production-facing concept and approved commercial projects | Separate root `/` in `com/` |
| Peak Irony | Separate editorial/magazine product | **No route, embed, nav item, asset, or redirect implemented** |

A future Peak Irony relationship can be handled by a *deliberate* outbound link or redirect to its independent domain after approval; avoid embedding its publishing stack in the Academy build. If an AEC umbrella directory is desired later, use a curated overview page that links to Peak Irony rather than moving its CMS or domain without a migration plan.

## Component map for the site lead
- `header / .brand / .desktop-nav / .mobile-nav` → reusable Academy header; replace prototype paths with router links.
- `.hero-grid / .orbital` → replace abstract placeholder with approved current hero asset, test mobile crop and text contrast.
- `.grid / .card` → flexible category and project card shell; feed only approved public records.
- `data-filter` + `data-category` → accessible client-side category filter; can be migrated to React state if the source uses Next.js.
- `.notice` → prominent planning/preview state indicator.
- `.steps` → illustrative owner workflow; do **not** ship as if functioning auth or storage.

## Data and publishing contract (future implementation, not active code)
Suggested minimal record fields: `id`, `owner_id`, `title`, `category`, `summary`, `status` (`draft|review|published|archived`), `visibility` (`private|shared|public`), `approved_at`, `credits`, `asset_ids`, `version`, `created_at`, `updated_at`.

Authorization belongs on the server. Public queries must filter on `status=published`, `visibility=public`, and approved publication metadata; **never** rely on CSS hidden cards for confidentiality. Separate private source assets from public renditions. Keep file versions and moderation actions auditable. The member must explicitly share private work before any other user accesses it. Owner edit controls require verified authentication, per-page authorization, draft persistence, preview, publish/unpublish, and version rollback.

## Domain and launch gates
- Confirm the exact purchased domains in the registrar account before any DNS work. No domain names are assumed here.
- Confirm which Vercel team/project and source revision are authoritative. A read-only inspection was blocked with HTTP 403 during this run.
- Keep Academy and commercial code/deployments independently scoped until legal/operating decisions are approved.
- No live deployment, DNS change, redirect, CMS write, repository change, or content publication was performed.

## Mobile acceptance checklist
At 360px, 390px, 768px, and 1280px: no horizontal overflow; menu reachable; focus visible; buttons at least ~44px tall; copy legible; filter announces result count; hero artwork crop safe; all internal links work. Before any production release, add privacy, terms, consent, and contact pages only from reviewed and approved text.
