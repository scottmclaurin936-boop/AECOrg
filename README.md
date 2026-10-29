# Academy of Emerging Creators (AECOrg)

Welcome to the official repository for the **Academy of Emerging Creators**. This repository houses the core framework, prototypes, and digital assets dedicated to empowering, educating, and supporting creators.

## 🚀 About the Project
The Academy of Emerging Creators is designed to pioneer new standards in organizational history, leadership frameworks, and creator enablement. This repository contains the frontend web prototypes and structure built to establish our digital footprint.

## 📁 Repository Structure
- **public/**: The published public website (creator directory homepage).
- **library-site/**: The separately deployed, platform-protected private library workspace.
- **tests/**: Automated checks for the site.

## 🛠️ Built With
- Modern web prototyping tools and AI-assisted frameworks.
- Clean, modular HTML/CSS/JS architecture.

## 📄 License
Copyright © Academy of Emerging Creators. All rights reserved.

## Site layout and checks

- `public/` is the **only** published output for the `aecorg` project. It contains the uploaded creator-directory design, section navigation, and browser-only text drafts. The old `Index.html` placeholder has been removed.
- `library-site/` is deployed separately to `aecorg-library`. It is **not** part of the public site's output.
- Run `npm ci && npm test` (Node 24) for navigation, theme, draft persistence, storage-failure, export, and public-output boundary tests.

## Public homepage

The public homepage is https://aecorg.vercel.app. Draft editing is deliberately local, not an admin publishing interface. Text and theme preferences persist in this browser using localStorage. Draft text is loaded as text, never inserted as HTML. Visitors cannot change the published site. Export produces a text backup; no draft is uploaded.

To publish changes, update the source through review and deploy the repository root to the existing `aecorg` project. Its `vercel.json` selects `public/` as the output. The library link targets https://aecorg-library.vercel.app.

## Private library: required platform protection

**Before deploying the library, the separate `aecorg-library` project must have Vercel Authentication enabled for All Deployments** (`ssoProtection.deploymentType = "all"`). This is a platform setting, not an HTML feature, and is not enforced by `vercel.json`. Verify it after deployment:

```sh
vercel project protection aecorg-library --json --scope scott-5393
```

Do not disable protection, add public deployment exceptions, or create public share/bypass links for this workspace. Deploy only `library-site/` to the existing `aecorg-library` project, never to the public project. The public homepage stays public.

The library starts as an empty workspace for authorized Vercel team users; it is not a public member-login system. Its notes save only in the signed-in browser's localStorage and can be exported. There is no cloud upload, database, cross-device sync, or durable archive yet. Local drafts are not encrypted by this application and should not be used for secrets on shared devices. Sign-in protection gates web requests; it does not encrypt device storage.

**Never commit manuscripts, credentials, personal notes, or private documents to this repository or to `public/`.** Private documents need separate authenticated storage before a real archive can be enabled. No private documents are included in this change.
