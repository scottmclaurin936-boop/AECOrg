# AEC web presence — independent handoff package
Original draft prepared October 16, 2026; extended October 17, 2026. **Local draft only. Not approved, uploaded, or deployed.**

## Scope and provenance
- This is an independent, modular HTML/CSS/JS candidate. It does **not** replace the current V4.2/Grok source or alter any live project.
- Based on AEC October 5 V4.2 work order and website lead handoff for requirements only; neither is proof that the October 16 source remains identical.
- Current approved hero image and latest Grok package were not accessible as source files during this run; abstract placeholders were used instead of reviving historical imagery.
- Vercel project inspection returned **403 forbidden** on October 16, 2026; the available container did not have the Vercel CLI. Live deployment, domains, and auth state are **unverified**.
- No legal status, tax exemption, membership enrollment, price, business offering, or publication approval is implied.

See `docs/DELTA_2026-10-17.md` for the latest changes.

## Files
- `org/index.html` — Academy/public umbrella homepage
- `org/about.html` — founder and governance information placeholders
- `org/member-001.html` — Scott McLaurin flagship profile and owner-workbench *specification*, not a functional editor
- `org/projects.html` — functioning client-side category filter for placeholder project cards
- `com/index.html` — separate commercial/production concept, without sales or payment functionality
- `shared/style.css` — responsive visual system and accessible navigation
- `shared/app.js` — mobile menu closing and filter interactions
- `docs/INTEGRATION.md` — adoption and separation notes

## Preview
Open `org/index.html` and `com/index.html` in a browser. No build system, packages, network requests, or login needed. Both are static and work with JavaScript disabled except category filtering. All pages contain `noindex,nofollow` as a precaution, **not** as access control.

## Integration priority
1. Lead reviews this package against **latest** approved Grok/V4.2 source and selected hero art.
2. Adopt individual layout patterns/components only where they improve the current site; don't overwrite the live project.
3. Add real project media only after creator approval and asset verification.
4. Implement authenticated server-side owner editing and durable storage separately; never expose private drafts through static assets.
5. Test mobile navigation, preview/draft/publish separation, and access control before private deployment.
6. Only after explicit founder authorization, deploy to a protected preview and verify domain routing.

## October 18 update
See `docs/DELTA_2026-10-18.md` for three new review pages, navigation/accessibility improvements, and browser QA. All work remains unapproved/offline.

## October 19 update
See `docs/DELTA_2026-10-19.md` for the new Academy project record, production workflow, searchable shelf, and content validation gate. This is still an offline candidate only.

## October 20 update
See `docs/DELTA_2026-10-20.md`, `docs/MEMBERSHIP_IMPLEMENTATION_SPEC.md`, `docs/ROUTES_AND_COMPONENTS.md`, and `docs/TEST_REPORT_2026-10-20.md`. The 18-page package adds complete site maps, application-and-approval UX, a production brief preview, and an offline JSON settings lab. No live intake or signup was enabled.
