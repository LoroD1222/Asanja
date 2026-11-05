# Migration Progress

Last updated: 2026-11-04

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
`asanja_safaris` entries. There are no published WordPress blog posts; `/blogs/`
is the intentionally empty archive shell shown on the live site.

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

## Current priority order

1. Configure and verify real form delivery with new deployment secrets.
2. Test form receipt on a deployment preview.
3. Run deployed Lighthouse/accessibility/social/schema checks.
4. Obtain explicit deployment authorization.

## Latest live-reference corrections

- [x] Compared the original live typography with the migrated pages and matched the live site's actual sans-serif fallback instead of the locally available serif font file.
- [x] Restored the production intro sentence that WordPress injects on 23 content pages; kept the intentionally empty blog archive unchanged.
- [x] Restored the original WhatsApp contact control on all 24 routes.
- [x] Re-ran interactions and all-route responsive checks after regeneration; mobile, tablet, and desktop passes have zero failures.
