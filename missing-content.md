# Missing Content and Media Audit

Audit date: 2026-11-04

## Published content coverage

No published WordPress content page is currently missing.

- Published WordPress pages: 19.
- Published `asanja_safaris` entries: 5.
- Migrated public content routes: 24.
- All 24 have corresponding generated HTML.
- Structural comparison found matching Elementor parent-section IDs, form counts, carousel/widget counts, image counts, and link counts.
- Normal pages have exact normalized text parity with the raw WordPress snapshot.
- The five safari items have equal normalized text length; their only expected difference is semantic heading-tag normalization with visual compatibility classes.

## Blog content

- The WordPress database contains no currently published standard posts.
- It contains 169 draft posts and two empty auto-drafts.
- The 169 drafts are now in scope for import into Sanity as unpublished documents.
- They remain intentionally excluded from public routes, public queries and the sitemap until individually approved and published.
- `/blogs/` is present and matches the currently published empty WordPress archive; it will become the published-only Sanity listing.

## Media coverage

- Original media filesystem: approximately 3,005 files.
- Current production snapshot: approximately 221 media files.
- This is a selective production copy, not a complete media-library migration.
- The asset audit checks all HTML/CSS references and currently reports zero missing referenced assets.
- Unreferenced media should not be copied blindly; add files only when a published page, gallery, responsive source, downloadable brochure, schema image, or social image requires them.

## Verification results and remaining external checks

- Media-carousel image lists on all five camp pages are present, load from local assets, and work with the restored gallery/lightbox runtime.
- Featured/social images for every route at their final production URL.
- Downloadable brochures or files linked from buttons.
- Review content is embedded in the page snapshot and the navigation widget is working; no external feed is required for the preserved entries.
- Newsletter legal/consent copy after a production subscription service is selected.
- The original WPForms plugin is absent from the backup. Its raw shortcodes are hidden and the complete adjacent Elementor booking/planning forms are restored instead; no field copy was invented.

## Content rules

- Import the 169 WordPress posts as Sanity drafts, but do not publish them automatically.
- Do not invent missing copy.
- Do not substitute generated or stock media.
- Preserve original slugs and page-specific layouts.
- Treat the WordPress database, raw snapshot, original media, and live site as the content source of truth.
