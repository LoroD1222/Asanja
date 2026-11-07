# Current Project Audit

Audit date: 2026-11-04

## Executive summary

This is an existing WordPress-to-Next.js migration and must be repaired in place. The current implementation is not a conventional component-based Next.js application: a single App Router catch-all route reads pre-rendered WordPress HTML from `public/legacy` and returns it as an HTML response. This approach preserves the original Elementor markup and CSS very accurately, but it also preserves obsolete WordPress client scripts that do not all initialize correctly outside WordPress.

The content migration is substantially complete. The restored WordPress database contains 19 published pages and 5 published `asanja_safaris` items, and all 24 are present in the Next.js snapshot. A structural comparison found matching text lengths, Elementor parent-section IDs, form counts, carousel counts, image counts, and link counts for the normal pages. The five safari itinerary pages differ only because SEO heading tags were deliberately normalized while their visual classes were preserved.

The compatibility repair is now substantially complete. Historic redirects, camp galleries/lightboxes, Safari tabs and loop carousel, FAQ accordions, reviews navigation, menu focus handling, missing booking/planning forms, form validation, and original success redirects are implemented and browser-tested. Production form delivery and final deployed-host checks still require owner-supplied configuration and a deployment preview.

## Architecture

- Framework: Next.js 16 App Router with TypeScript.
- Runtime routes:
  - `app/[[...path]]/route.ts`: catches page requests, maps legacy `?p=` IDs, reads `public/legacy/<route>/index.html`, and returns raw HTML.
  - `app/api/forms/route.ts`: validates, rate-limits, classifies, and forwards JSON form submissions to `FORM_WEBHOOK_URL`.
- Client compatibility layer:
  - `public/migration.css`: visual compatibility, SEO heading preservation, carousel/lightbox fallback, popup/menu fallback, form recovery, and responsive corrections.
  - `public/migration.js`: lazy-content reveal, all retained carousel types, tabs, accordions, lightbox, popup/menu behavior, focus handling, and form interception.
- Generated content:
  - `public/legacy`: committed production HTML, Elementor CSS/JS, fonts, and referenced media.
  - `site-snapshot`: ignored raw WordPress capture used as a regeneration source.
  - `tools/prepare-snapshot.mjs`: refreshes generated pages and applies URL, SEO, heading, asset, and script transformations.
- Original source material:
  - `wordpress-source`: ignored WordPress backup, media, plugins, themes, and database dump.
  - `.local-mariadb`: ignored restored database.
  - `wordpress-runtime`: ignored local WordPress runtime linked to the restored source.

## Preserved original systems

- Hello Elementor theme markup and styles.
- Elementor and Elementor Pro page/template markup.
- Original header template, footer template, popup template, global kit styles, color variables, media, and page-specific CSS, with a compatibility override matching the live site's actual font fallback.
- Original 24 public content routes and five safari itinerary slugs.
- Original page titles, descriptions, Open Graph tags, schema, canonical URLs, and internal links.
- Original desktop/tablet/mobile CSS breakpoints embedded in Elementor styles.

## Current strengths

- All 24 published WordPress content items are present.
- All audited generated pages have one H1, title, meta description, canonical, keywords, and image alt coverage.
- Original text and Elementor section hierarchy are preserved.
- `npm run build`, `seo:audit`, `assets:check`, and `links:check` pass.
- 2,028 internal links resolve in the generated snapshot.
- 91 HTML/CSS files have no missing referenced local assets.
- The homepage header, hero, all sections, nested carousels, menu popup, footer, and desktop/mobile layout have been repaired and browser-tested.
- All 29 active historic Rank Math paths return the expected 301 target.
- Browser interaction checks pass for camp media galleries/lightboxes, Safari tabs and loop carousel, FAQ accordions, reviews navigation, and restored booking/planning forms.
- All 24 routes were checked at 390px, 768px, and 1440px for document landmarks, horizontal overflow, broken loaded images, live intro copy, typography, and the WhatsApp control. Seventy-two QA screenshots were captured.
- Original backup/database/runtime directories are ignored by Git.

## Architectural risks

- Pages are raw HTML responses, not Server Components. The Next.js Metadata API and React component composition are therefore not currently used for migrated pages.
- Every page request performs a filesystem read because the catch-all route is `force-dynamic`.
- WordPress/Elementor runtime scripts remain large and several no longer initialize reliably; compatibility code must replace failed behavior selectively.
- The project declares `next`, `react`, and `react-dom` as `latest`; the lockfile currently supplies tested versions, but future installs can drift.
- The migration depends on generated files. Regeneration must always run the validation scripts before generated changes are accepted.

## Data and security observations

- The ignored WordPress backup contains live-looking mail/API configuration. These values must not be copied into source control or client code.
- Deployment secrets must be configured through Vercel/environment settings.
- Any credentials inherited from the WordPress backup should be rotated before production cutover.
- The form endpoint now has payload/email validation, a honeypot, in-memory rate limiting, a delivery timeout, and optional bearer authentication. Deployment-grade edge rate limiting may still be desirable at scale.

## Audit baseline

- WordPress database: 19 published pages, 5 published safari entries, 650 attachment records.
- Generated routes: 24 HTML routes, including the noindex thank-you route.
- Source media files: 3,005.
- Currently copied production media files: 221.
- Missing referenced production assets: 0.
- Published WordPress blog posts: 0. The 169 post records are drafts; under the expanded 2026-11-06 scope they are Sanity migration targets but must remain unpublished.

## Required next work

1. Configure a new/rotated `FORM_WEBHOOK_URL` and optional `FORM_WEBHOOK_SECRET` in the deployment environment.
2. Send and verify real booking, trip-planning, and newsletter submissions.
3. Run deployed-host performance, accessibility, schema, and social-card checks.
4. Complete screenshot comparison on the deployment preview for every route/template.
5. Obtain explicit authorization before production deployment.
