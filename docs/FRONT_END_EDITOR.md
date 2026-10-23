# AEC visual front-end editor — October 22, 2026

## Status
**Local draft only; no deployment, live publication, or identity system.** The Academy (.org) and production (.com) HTML pages now load `shared/visual-editor.js`. Their initial blue-and-teal layout and links are retained. This is a review/editor candidate, not an approved public site.

## Open and edit on a phone or computer
1. Open any `org/*.html` or `com/*.html` file locally, or append `?edit=1` to an unpublished preview URL. The "Edit page" control appears at the lower-right only in local/explicit preview mode.
2. Tap **Edit page**. Tap text anywhere on the page (including navigation and footer) and type replacements directly. Tap an existing image or an abstract hero placeholder, then choose **Replace image** to choose a photo from your device. The editor compresses large photos to a max 1600-pixel JPEG locally.
3. To add an image, tap the section first and select **Add image**. Change text, navigation links, alt descriptions, accent color, section order and section visibility with the panel.
4. The editor saves a draft in this device/browser's `localStorage` for each page. **Export all pages** downloads a JSON backup; **Import draft** restores that backup in the same editor. Export before clearing browser data or moving between devices.

## Design and safety boundaries
- No API calls, form submissions, automatic publication, GitHub commits, or Vercel deployments occur from this visual editor.
- `?edit=1` is **not authentication**, and neither this local editor nor CSS hiding provides secure private content management. Do not put sensitive drafts into a publicly hosted site; local previews are safest until owner authentication and durable server-side drafts are installed.
- Images stored in browser storage may be limited by device quotas; export often, especially after replacing multiple images. If a save fails the editor will show an error.
- Edits made locally affect only the current browser. Other users will not see them. Public site editing/publishing requires an authenticated backend and audited admin controls.
- The Academy membership mode remains application-and-approval concept only, with instant signup inactive.
- The separate October 22 `project-workbench.html` remains available for structured record drafting.

## Next integration gate
Before a publish-capable owner CMS: verify authoritative approved content/assets, configure authenticated role-gated editing, store draft revisions server-side, implement safe media uploads and preview/review/publish/unpublish, and test on phone. Founder authorization is required for live publication.
