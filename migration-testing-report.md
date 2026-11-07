# Migration Testing Report

Updated: 2026-11-06

## Tests completed

| Test | Result | Evidence |
|---|---|---|
| Studio TypeScript check | Pass | `cd studio && npm run typecheck` |
| Migration utility unit tests | Pass | `cd migration && npm test` |
| Read-only database extraction | Pass | 169 drafts + 2 auto-drafts extracted; 3,005 upload files inventoried |
| WP All Export reconciliation | Pass | 170 export rows; CSV-only ID 37587 quarantined |
| Portable Text transformation | Pass | Exactly 169 article plans, 2 authors, 22 categories and 213 tags |
| Draft/publication safety | Pass | 169 plans use `editorialStatus: draft`, `seo.noIndex: true`; no external writes or publishes |
| WordPress ID uniqueness | Pass | 169 unique source IDs |
| Slug uniqueness | Pass | 169 unique source/proposed slugs; two proposals flagged |
| Body presence | Pass | All 169 plans contain non-empty Portable Text arrays |
| Portable Text key check | Pass | Every top-level block and text child has a key |
| Featured image reconciliation | Pass with review item | 157 references preserved; one source attachment unresolved |
| Inline image reconciliation | Pass with review items | 132 blocks; 82 unresolved occurrences / 78 unique source URLs across 32 articles |
| Table conversion | Pass | 42 structured table blocks across 32 articles |
| Unsupported shortcode preservation | Pass with review items | 245 opening/closing shortcode blocks retained rather than discarded |
| SEO source coverage | Pass with review items | Five missing titles and three missing descriptions flagged for fallback/review |
| Import safety gate | Pass | Default importer run made 0 external reads, 0 external writes and 0 publications |
| Existing redirect regression suite | Pass | 29 exact redirects verified against an isolated fresh production build on port 3101 |
| Root Next.js production build | Pass | Next.js 16.4.4 production build completed successfully |
| Existing SEO/assets/links audits | Pass | 24 pages, 91 HTML/CSS files and 2,028 internal links checked without findings |

## Not yet testable

- Sanity Studio login, member permissions and dataset access.
- Creating, editing, publishing and unpublishing an actual Sanity document.
- Sanity asset upload/deduplication and idempotent rerun mutations.
- Scheduled publishing, because the owner has not selected a supported workflow/plan.
- Authorized Next.js Draft Mode preview and Visual Editing.
- Published-only blog listing/detail/category/tag queries.
- Webhook authentication and revalidation.
- Final desktop/tablet/mobile blog rendering and production performance.

These require the owner-selected Sanity project/dataset, approved editorial identities and hosting configuration. No claim is made that these external workflows are complete.
