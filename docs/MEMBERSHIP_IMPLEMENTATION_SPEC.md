# Membership implementation handoff — design only

The founder-selected direction is **application and approval**. This document defines an implementation boundary, not eligibility policy.

## Draft UI routes
- `/membership` — informational application-and-review concept.
- `/apply` — local non-submitting form preview.
- `/review-controls` — offline prototype editor; **not** an administrative control plane.

## Future backend requirements (not built)
1. Confirm founder-approved application fields, privacy notice, retention period, and eligibility language.
2. Accept real applications only via HTTPS, with server-side validation, spam protection, rate limits, and an authenticated reviewer queue.
3. Restrict reviewer access by role and record decision timestamps and audit history; never expose submissions in static JSON or frontend assets.
4. Generate account invitations only after explicit approval; use expiring, single-use links and a real identity provider.
5. Define notification, correction, deletion, and appeal processes before launch.
6. Keep `membership.mode=application_review` and `allow_public_signup=false` until the founder explicitly approves another mode.
7. Future instant sign-up can be a configurable enum in server-managed settings, but **must not** be enabled from public JavaScript or the review settings lab.

## Data and publication guardrails
- This prototype has no network requests, no localStorage, no cookies, and no real submission endpoints.
- Founder review is required before adding policies, service claims, public application opening, or assets.
- The Academy and commercial production surface should have separate site configurations and access scopes.
- Peak Irony remains an independent application/repository; future linking or redirect needs explicit approval.
