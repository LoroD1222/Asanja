# Information Required From Owner

Prepared: 2026-11-06  
Purpose: decisions, access and approvals required before creating or selecting a Sanity project, importing the 169 WordPress drafts, configuring production preview/revalidation, or changing production infrastructure.

Do not paste passwords, API tokens, private keys or one-time codes into ordinary chat. Configure secrets locally in ignored environment files or in the deployment provider's encrypted environment settings.

## Immediate blocking decisions

### 1. Existing Sanity project or approval to create one

- **Required:** Tell me whether Asanja Africa already has a Sanity project. If it does, provide only the non-secret project ID, organization name and dataset name. If it does not, approve creation of a new project under the correct organization.
- **Why:** The Studio configuration, schema deployment, dataset, CORS rules and import target cannot be safely chosen without this.
- **Mandatory:** Yes, before Studio initialization or any import.
- **Where to obtain it:** `https://www.sanity.io/manage` → select the project → project settings. A project ID is not a secret; tokens are secrets.
- **Recommendation:** Reuse an existing Asanja-owned project if one exists. Otherwise create one named `Asanja Africa CMS` owned by the business, not by a contractor's personal account.
- **Impact:** Development, ownership, billing, security and deployment.

### 2. Sanity organization and long-term owner

- **Required:** Name the organization/account that should legally and operationally own the project, and identify one permanent business administrator.
- **Why:** Project ownership controls billing, recovery, member access and future maintenance.
- **Mandatory:** Yes.
- **Where to obtain it:** Sanity Manage → organization settings/members.
- **Recommendation:** Use an Asanja Africa organization with at least two trusted administrators.
- **Impact:** Security, access continuity and billing.

### 3. Dataset selection

- **Required:** Approve the dataset name and visibility.
- **Why:** All imported articles, assets and references live in a dataset; changing this later complicates environments and deployment.
- **Mandatory:** Yes.
- **Where to obtain it:** Sanity Manage → project → datasets.
- **Recommendation:** Use a private dataset named `production`. If a rehearsal import is desired, create a separate private dataset named `staging` and import there first.
- **Impact:** Development, security, preview and production data separation.

### 4. Sanity authentication

- **Required:** An authorized owner must sign in locally with the Sanity CLI or grant the implementing account appropriate project access.
- **Why:** Schema deployment, dataset creation, asset upload and bulk import require authenticated access.
- **Mandatory:** Yes, after project/dataset decisions.
- **Where to obtain it:** Run `npx sanity@latest login` locally and complete the browser sign-in. Do not send the session or tokens in chat.
- **Recommendation:** Use short-lived/local CLI authentication for setup. Create narrowly scoped server tokens only when the preview/deployment design requires them.
- **Impact:** Security and implementation.

### 5. The CSV-only article (WordPress ID 37587)

- **Required:** Decide whether the article present in the WP All Export CSV but absent from the restored database should be recovered into Sanity, quarantined for review, or excluded as deleted content.
- **Why:** Importing it silently could restore intentionally deleted content; excluding it silently could lose content.
- **Mandatory:** Yes before the final count is declared complete. It is separate from the 169 database drafts.
- **Where to review it:** The post export archive documented in `complete-wordpress-inventory.md`.
- **Recommendation:** Quarantine it in the migration report and do not import until an owner confirms its history.
- **Impact:** Content completeness and editorial governance.

### 6. Two missing article slugs

- **Required:** Approve slugs for WordPress IDs 28352 (`Swahili`) and 28353 (`Endangered species of Tanzania`).
- **Why:** Stable slugs are required for preview URLs, future public URLs and idempotent routing.
- **Mandatory:** Yes before frontend route mapping; not required to preserve the raw content.
- **Where to decide:** Editorial/SEO owner.
- **Recommendation:** Use `swahili` and `endangered-species-of-tanzania` unless historic analytics or backlinks show different URLs.
- **Impact:** SEO and routing.

### 7. Blog URL policy

- **Required:** Confirm whether each article should keep its historical exported path, such as `/wildlife/.../` and `/national-parks/.../`, or move to a single `/blogs/<slug>/` route with permanent redirects.
- **Why:** This determines canonical URLs, redirect generation, internal-link rewriting and sitemap entries.
- **Mandatory:** Yes before public article routes are finalized.
- **Where to decide:** SEO owner using Search Console/analytics/backlink data if available.
- **Recommendation:** Preserve historical paths when a reliable permalink exists. Use `/blogs/<slug>/` only for records without a trustworthy legacy path, and create 301 redirects for every changed URL.
- **Impact:** SEO, routing and analytics continuity.

### 8. Public author identities

- **Required:** Provide approved public display names, slugs, biographies and optional portraits for the two historical author IDs 5 and 7. Confirm whether old articles should show an individual author or `Asanja Africa Editorial Team`.
- **Why:** The current database no longer contains those user records, while the export contains private login/email data that must not be exposed.
- **Mandatory:** Mandatory for a finished public author presentation; the initial draft import can use unresolved author references with a quality flag.
- **Where to obtain it:** Editorial/HR/brand owner.
- **Recommendation:** Use one approved `Asanja Africa Editorial Team` author if individual attribution cannot be verified. Preserve original author IDs in hidden migration metadata.
- **Impact:** Content attribution, privacy and structured data.

### 9. Missing media recovery policy

- **Required:** Provide any older blog media backup or authorized access to the former `blog.asanjaafrica.com` uploads if available, and decide how unresolved images should be handled after recovery attempts.
- **Why:** One featured attachment file and 66 unique inline-image URLs across 26 posts are not currently present at their referenced paths in the recovered uploads tree.
- **Mandatory:** Yes for a claim of complete media fidelity. The text-only draft import can proceed with explicit per-article warnings.
- **Where to obtain it:** Hosting backups, Updraft/WordPress backups, CDN/DAM storage, previous developer, or approved web archive recovery.
- **Recommendation:** Recover originals first. Never substitute unrelated stock images. If an asset cannot be recovered, preserve the article as a draft and flag the exact missing block for editorial repair.
- **Impact:** Content fidelity, accessibility and SEO.

### 10. Draft-page decisions

- **Required:** Decide the disposition of draft pages `Reviews - Trip advisor` (ID 2437), `Elementor Page #5126` (ID 5126), and `TEST` (ID 37070).
- **Why:** The master scope explicitly requires all draft pages to be inventoried rather than silently ignored.
- **Mandatory:** Required for final migration sign-off, not for starting the article CMS.
- **Where to decide:** Site owner/editor.
- **Recommendation:** Exclude `TEST` and the unnamed Elementor page after confirming they contain no unique content. Treat `Reviews - Trip advisor` as superseded by `/asanja-reviews/` unless unique content is found.
- **Impact:** Content completeness and route governance.

## Editorial workflow decisions

### 11. Editor list and roles

- **Required:** Provide the names and business email addresses of people who need Sanity access, plus who may publish versus edit drafts only.
- **Why:** Project-member access and least-privilege roles must be configured intentionally.
- **Mandatory:** Yes before editorial handoff; not required for local schema work.
- **Where to obtain it:** Internal team list.
- **Recommendation:** Start with two administrators and assign other users the least-privileged role that supports their work.
- **Impact:** Security and editorial operations.

### 12. Review/approval workflow

- **Required:** Decide whether editors may publish directly or whether articles require approval by a designated publisher.
- **Why:** This affects Studio structure, status indicators, validation and possible workflow tooling.
- **Mandatory:** Optional for the initial migration; required before editorial launch.
- **Where to decide:** Editorial owner.
- **Recommendation:** Keep all imported articles as drafts, require an editorial and SEO review, and publish in controlled batches.
- **Impact:** Editorial workflow and content quality.

### 13. Scheduling

- **Required:** Confirm whether scheduled publication is required and, if so, expected frequency and responsible editor.
- **Why:** Scheduling configuration and plan capabilities must be validated against the selected Sanity project.
- **Mandatory:** Optional.
- **Where to decide:** Editorial calendar owner; current feature availability will be verified after project selection.
- **Recommendation:** Enable scheduling only if the team will use a maintained publication calendar.
- **Impact:** Editorial workflow and Sanity configuration.

### 14. Historical dates

- **Required:** Confirm that original WordPress publication and modified dates should be preserved even though all records currently have draft status.
- **Why:** Historical dates affect article display, sorting, structured data and editorial context.
- **Mandatory:** The master brief already requests preservation; respond only if a different policy is desired.
- **Where to decide:** Editorial/SEO owner.
- **Recommendation:** Preserve both source dates in explicit fields. Do not use Sanity `_createdAt` or `_updatedAt` as replacements.
- **Impact:** Content, SEO and chronology.

### 15. Publication policy for the 169 articles

- **Required:** No new decision is required unless the instruction changes.
- **Why:** The master brief explicitly requires all 169 to remain drafts after import.
- **Mandatory:** Locked requirement.
- **Recommendation:** Publish nothing during migration. Use authorized preview for review and publish only after individual approval.
- **Impact:** Security, SEO and editorial governance.

## Deployment and preview requirements

### 16. Next.js hosting provider and project

- **Required:** Identify the production hosting provider, project name, deployment owner and preview URL convention.
- **Why:** Environment variables, Draft Mode callbacks, CORS, webhook URLs and revalidation depend on the deployed origin.
- **Mandatory:** Yes before production preview and webhook configuration.
- **Where to obtain it:** Hosting dashboard (for example Vercel, Netlify or self-hosted infrastructure).
- **Recommendation:** Use preview deployments for CMS QA before touching the production domain.
- **Impact:** Deployment, preview, security and performance.

### 17. Studio hosting choice and URL

- **Required:** Choose Sanity-hosted Studio or owner-managed hosting, plus the desired Studio hostname.
- **Why:** Editors need a stable, trusted Studio URL and the project needs correct CORS/Presentation settings.
- **Mandatory:** Required for editorial launch, not local development.
- **Where to decide:** Technical owner.
- **Recommendation:** Use Sanity-hosted Studio with an Asanja-branded hostname unless company policy requires self-hosting.
- **Impact:** Deployment and editor access.

### 18. Required environment variables and secrets

- **Required:** Configure values in local ignored files and the hosting provider; do not send secret values in chat.
- **Mandatory:** Yes for preview and production integration.
- **Recommended variables:**
  - `NEXT_PUBLIC_SANITY_PROJECT_ID` — non-secret project ID.
  - `NEXT_PUBLIC_SANITY_DATASET` — non-secret dataset name.
  - `SANITY_API_READ_TOKEN` — server-only token for authorized draft preview/live content.
  - `SANITY_REVALIDATE_SECRET` — server-only webhook signature secret.
  - `SANITY_PREVIEW_SECRET` if the selected preview implementation requires it.
  - Existing `FORM_WEBHOOK_URL` and optional form webhook authentication values.
- **Where to obtain it:** Project/dataset values from Sanity Manage; tokens from Sanity API settings; webhook secret generated securely; form endpoint from the owner's delivery service.
- **Impact:** Security, preview, revalidation and forms.

### 19. Production domain and cutover approval

- **Required:** Confirm the canonical production origin and explicitly approve any later production deployment, DNS change or cutover window.
- **Why:** Canonicals, sitemap URLs, webhooks and CORS must use the final origin; infrastructure changes are irreversible/high-impact without coordination.
- **Mandatory:** Yes before production cutover.
- **Where to obtain it:** Domain/DNS and hosting owner.
- **Recommendation:** Keep `https://asanjaafrica.com` as canonical and perform cutover only after a complete preview crawl and owner sign-off.
- **Impact:** Deployment, SEO and availability.

## SEO and analytics inputs

### 20. Search Console, analytics and backlink evidence

- **Required:** If available, provide an export of indexed article URLs, top landing pages and important backlinks—never account passwords.
- **Why:** The CSV shows historical article paths and historical `publish` statuses that conflict with the current database drafts. Search evidence determines which legacy URLs deserve preservation/redirect priority.
- **Mandatory:** Optional but strongly recommended before URL cutover.
- **Where to obtain it:** Google Search Console page/indexing and performance exports; analytics landing-page export; backlink tool export.
- **Recommendation:** Use exports, not account credentials.
- **Impact:** SEO and redirect accuracy.

### 21. SEO fallback policy

- **Required:** Approve generation rules for the five missing SEO titles, three missing descriptions, absent canonicals and absent social metadata.
- **Why:** Missing fields need deterministic fallbacks without inventing marketing claims.
- **Mandatory:** Required before publication; not before draft import.
- **Where to decide:** SEO/editorial owner.
- **Recommendation:** Fall back to article title plus brand for SEO title, excerpt or a plain-text body lead for description, approved route for canonical, and featured image for Open Graph. Flag every fallback for review.
- **Impact:** SEO and social sharing.

## Security actions

### 22. Rotate the GitHub credential previously shared in chat

- **Required:** Revoke the previously shared GitHub personal access token and create a replacement only if still needed.
- **Why:** A credential entered into ordinary chat must be treated as exposed.
- **Mandatory:** Yes, security-critical.
- **Where to obtain it:** GitHub → Settings → Developer settings → Personal access tokens.
- **Recommendation:** Use a fine-grained token with repository-only access, minimum permissions and an expiration date. Prefer authenticated GitHub CLI/credential manager instead of placing tokens in remotes, files or chat.
- **Impact:** Repository security.

## Recommended response format

The owner can respond without secrets using this template:

```text
Sanity project: existing / create new
Project ID (if existing, non-secret):
Organization and permanent admin:
Dataset: production / production + staging
Studio hosting preference:
Deployment provider/project:
Production canonical domain:
Legacy URL policy: preserve paths / consolidate under /blogs/
CSV-only post 37587: recover / exclude / investigate
Slug 28352:
Slug 28353:
Author policy and approved public names:
Draft-page decisions:
Missing-media backup available: yes / no / investigating
Editor roles:
Approval workflow:
Scheduling required: yes / no
SEO/analytics exports available: yes / no
GitHub credential rotated: yes / no
```

After these decisions, credentials should be configured through local CLI authentication and encrypted environment settings, not pasted into chat or committed.
