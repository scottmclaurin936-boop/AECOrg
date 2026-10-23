# Peak Irony integration boundary — design options only

**Current state: no integration, no redirect, no domain/DNS changes.**

Peak Irony remains an independent magazine codebase, content pipeline, editorial process, and deployment. The AEC `.org` Academy site and AEC `.com` production concept must not import its CMS, articles, editorial feed, authentication, or publishing credentials.

## Future options, only with explicit approval

1. **Outbound link:** Add a labeled external link from a curated AEC project page to the independently hosted magazine. No reverse proxy, shared database, or redirect is required. This is the lowest-coupling option.
2. **Umbrella landing page:** Create an Academy page explaining the relationship in founder-approved wording, then link to the magazine's independent domain. This preserves editorial and technical separation.
3. **Redirect from a designated AEC path:** A future 301/302 redirect may route an approved AEC-owned path to the magazine's independently hosted canonical URL. Require an explicit approved source path, destination, permanence decision, and ownership verification. Never assume a destination or configure a redirect before approval.

## Preflight gate

Confirm domain ownership and canonical URL; approve relationship wording and external-link label; document editorial/legal separation; verify analytics/privacy implications; test redirect loops and canonical metadata; preserve magazine's separate deployment and rollback. No DNS or routing records are included in this draft.
