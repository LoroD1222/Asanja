# All Pages Migration Report

Updated: 2026-11-06

## Public route coverage

The restored database contains 19 published pages and five published `asanja_safaris` documents. All 24 have a corresponding route under `public/legacy` and are served by the existing Next.js catch-all without being replaced by the CMS scaffold.

| Content group | Source count | Migrated routes | Current status |
|---|---:|---:|---|
| Published WordPress pages | 19 | 19 | Migrated and locally verified |
| Published safari custom posts | 5 | 5 | Migrated and locally verified |
| Standard WordPress blog drafts | 169 | 0 public | 169 local Sanity draft plans; not imported or published |
| WordPress auto-drafts | 2 | 0 | Empty; intentionally excluded pending evidence of meaningful content |
| Draft WordPress pages | 3 | 0 | Owner review required |
| CSV-only post ID 37587 | 1 | 0 | Quarantined for owner decision |

The route-by-route source IDs, paths and statuses are in `wordpress-to-nextjs-route-mapping.csv`; the full content inventory is in `complete-wordpress-inventory.md`.

## Public-site regression protection

- The new Studio and migration workspaces do not import into the Next.js runtime.
- Root TypeScript configuration excludes these separate workspaces.
- Existing generated HTML, CSS, assets, animations, carousels, forms and navigation remain unchanged by this checkpoint.
- The existing desktop Camps & Lodges popup navigation fix in `public/migration.js` remains preserved.
- Sanity blog routes will be added as explicit App Router pages before the legacy catch-all only after the dataset is approved and populated.

## Remaining page-level work

- Replace the empty `/blogs/` archive shell with a published-only Sanity listing after content integration.
- Add article, category and tag pages while preserving approved legacy URLs.
- Review and disposition the three draft pages and CSV-only article.
- Complete final deployment-preview crawl, form delivery tests and visual QA after CMS integration.

