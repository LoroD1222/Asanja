# Migration Progress

Last updated: 2026-11-06

## Scope expansion — 2026-11-06

The owner expanded the migration scope to include all 169 standard WordPress
draft posts and to make Sanity the permanent blog CMS. The earlier decision to
exclude drafts from the public snapshot remains correct for the live site, but
those drafts are now required as **unpublished Sanity documents**.

- [x] Reconcile restored database, WP All Export archive, current routes and media tree.
- [x] Create `complete-wordpress-inventory.md`.
- [x] Create `INFORMATION-REQUIRED-FROM-OWNER.md`.
- [x] Create updated missing-route and missing-media reports.
- [ ] Receive/confirm Sanity project, organization and dataset.
- [ ] Approve author identities, legacy URL policy, two missing slugs and CSV-only post ID 37587.
- [ ] Recover or explicitly disposition unresolved article media.
- [~] Scaffold standalone Sanity Studio; local schema/type checks pass, but real-project validation and deployment await owner configuration.
- [x] Build deterministic WordPress extraction and Portable Text transformation.
- [~] Validate exactly 169 local draft plans without publishing; actual Sanity import awaits owner configuration and content review.
- [ ] Implement published-only blog, article, category/tag and secure preview routes.
- [ ] Complete SEO, sitemap, redirect, webhook, responsive and production-build verification.

Status legend: `[x]` verified, `[~]` implemented but additional QA/configuration required, `[ ]` not complete.

## Phase 0 — source recovery and inventory

- [x] Preserve existing Next.js project.
- [x] Restore WordPress database locally.
- [x] Inventory published pages and custom safari entries.
- [x] Inventory original Elementor header, footer, popup, and page templates.
- [x] Preserve ignored WordPress backup/runtime/database sources.
- [x] Create required audit documents.

## Complete public page inventory

The restored WordPress database contains 19 published pages and 5 published
`asanja_safaris` entries. There are no currently published standard WordPress
blog posts; `/blogs/` is the intentionally empty archive shell shown on the
live site. The 169 standard posts are drafts and are now in scope for an
unpublished Sanity import.

| Route | Page type | Reconstruction status |
|---|---|---|
| `/` | Homepage | Complete |
| `/about/` | Brand story | Complete |
| `/camps-and-lodges/` | Camp collection | Complete |
| `/asanja-moru/` | Camp detail | Complete |
| `/asanja-sri-bustani/` | Camp detail | Complete |
| `/asanja-nyasirori/` | Camp detail | Complete |
| `/asanja-ruaha/` | Camp detail | Complete |
| `/asanja-under-the-stars/` | Camp detail | Complete |
| `/safaris/` | Safari collection | Complete |
| `/experiences/` | Experiences | Complete |
| `/asanja-reviews/` | Reviews | Complete |
| `/faqs/` | FAQ | Complete |
| `/contact/` | Contact | Complete; delivery requires production webhook |
| `/plan-my-stay/` | Trip-planning form | Complete; delivery requires production webhook |
| `/make-a-booking/` | Booking form | Complete; delivery requires production webhook |
| `/blogs/` | Empty blog archive | Complete |
| `/privacy-policy/` | Legal | Complete |
| `/terms/` | Legal | Complete |
| `/contact/thank-you/` | Form confirmation | Complete and noindex |
| `/asanja_safaris/tanzania-a-journey-through-natures-masterpieces/` | Safari itinerary | Complete |
| `/asanja_safaris/from-i-do-to-dreams-come-true-the-perfect-honeymoon/` | Safari itinerary | Complete |
| `/asanja_safaris/migration-madness/` | Safari itinerary | Complete |
| `/asanja_safaris/wild-treasures-of-tanzania/` | Safari itinerary | Complete |
| `/asanja_safaris/an-exclusive-safari-escape-a-family-or-friends-adventure-in-the-serengeti-with-just-3-tents-its-yours-alone/` | Safari itinerary | Complete |

## Phase 1 — routes and content

- [x] Migrate all 19 published pages.
- [x] Migrate all 5 published safari entries.
- [x] Preserve current production slugs.
- [x] Preserve text, section hierarchy, images, forms, and internal links.
- [x] Add selected WordPress `?p=` redirects.
- [x] Restore all ten Rank Math redirect groups (29 exact source paths).
- [x] Provide a 404 response fallback.

## Phase 2 — shared design

- [x] Preserve original Elementor colors, global kit, and page CSS, and match the sans-serif font fallback that the live site actually renders.
- [x] Repair homepage header and hero.
- [x] Restore homepage sections and footer.
- [x] Restore full-screen desktop/mobile menu.
- [x] Restore Camps & Lodges submenu toggle.
- [x] Restore homepage nested carousels.
- [x] Preserve lazy backgrounds and animation visibility.
- [x] Complete all-route layout checks at 1440px.
- [x] Complete all-route layout checks at 390px.
- [~] Complete final screenshot comparison on a deployment preview.

## Phase 3 — page interactions

- [x] Camp media carousels and responsive slide counts.
- [x] Camp image lightboxes and keyboard controls.
- [x] Camp nested content carousels.
- [x] Safari nested tabs with keyboard navigation.
- [x] Safari loop carousel.
- [x] FAQ accordion keyboard/mouse behavior and ARIA state.
- [x] Reviews widget navigation.
- [x] Video sources, controls, playback readiness, and responsive sizing verified locally (ready state 4, no media error).
- [x] External new-tab links secured and social destinations preserved.

## Phase 4 — forms and integrations

- [x] Preserve original form fields and visual layout.
- [x] Prevent fake successful submission when delivery is unavailable.
- [x] Implement validated `/api/forms/` forwarding endpoint.
- [ ] Configure production delivery service/webhook.
- [x] Add payload/email validation and form classification.
- [x] Add honeypot, rate limiting, timeout, and optional webhook authentication.
- [x] Restore original thank-you redirects.
- [x] Restore the complete Elementor booking/planning forms hidden beside unavailable WPForms shortcodes.
- [ ] Verify actual booking, plan-my-stay, and newsletter receipt.
- [ ] Decide and configure newsletter subscription integration.

## Phase 5 — SEO

- [x] Unique title and description per page.
- [x] Unique production canonical per page.
- [x] Open Graph URL parity.
- [x] One H1 per page with preserved visual styling.
- [x] Image alt coverage.
- [x] Structured data JSON preserved and normalized.
- [x] Sitemap and robots.
- [x] Thank-you page noindex.
- [x] Restore historic redirects.
- [ ] Verify social images and schema on deployed hostname.

## Phase 6 — testing and deployment readiness

- [x] Production build passes.
- [x] SEO audit passes.
- [x] Asset-reference audit passes.
- [x] Internal-link audit passes.
- [x] Homepage desktop/mobile interaction smoke test passes.
- [x] Add automated browser route/interaction audit (`tools/runtime-audit.mjs`).
- [x] Add historic redirect regression audit.
- [x] Capture and inspect 72 local QA screenshots: all 24 routes at 390px, 768px, and 1440px.
- [x] Preserve immutable one-year caching for versioned legacy assets and add edge stale-while-revalidate caching for HTML routes.
- [ ] Test all forms against a real delivery target.
- [ ] Test production deployment preview.
- [ ] Run performance/accessibility audits after functionality stabilizes.
- [ ] Obtain explicit authorization before production deployment.

## Phase 7 — Sanity CMS and 169-post recovery

- [x] Add a standalone Sanity Studio workspace using environment-only project configuration.
- [x] Define article, author, category, tag, SEO, migration provenance and structured Portable Text schemas.
- [x] Add editor lists for imported, review, scheduled and published articles.
- [x] Implement a repeatable read-only WordPress extractor.
- [x] Reconcile 169 drafts, two excluded auto-drafts and one quarantined CSV-only record.
- [x] Convert 169 bodies into Portable Text plans with images, links, headings, lists, tables and preserved shortcode review blocks.
- [x] Validate that all 169 plans remain drafts/noindex and that no external writes or publications occurred.
- [x] Produce `169-blog-post-migration-report.md`, CMS architecture, schema, setup and testing documentation.
- [ ] Receive owner-approved Sanity project, dataset, roles, author profiles, URL policy and media exception policy.
- [ ] Review five representative transformed articles with the content owner.
- [ ] Implement and run the idempotent asset/document importer against the approved dataset.
- [ ] Add published-only blog routes, secure Draft Mode preview, Visual Editing, sitemap and webhook revalidation.

## Current priority order

1. Receive the owner decisions listed in `INFORMATION-REQUIRED-FROM-OWNER.md`.
2. Review representative Portable Text conversions and resolve identity/slug/media gates.
3. Import exactly 169 drafts into the owner-approved Sanity dataset without publishing.
4. Implement and verify the published-only Next.js blog and secure preview workflow.
5. Configure form delivery and run full deployment-preview, accessibility, SEO and performance QA.
6. Obtain explicit deployment authorization.

## Latest live-reference corrections

- [x] Compared the original live typography with the migrated pages and matched the live site's actual sans-serif fallback instead of the locally available serif font file.
- [x] Restored the production intro sentence that WordPress injects on 23 content pages; kept the intentionally empty blog archive unchanged.
- [x] Restored the original WhatsApp contact control on all 24 routes.
- [x] Re-ran interactions and all-route responsive checks after regeneration; mobile, tablet, and desktop passes have zero failures.
