# Complete WordPress Inventory

Audit date: 2026-11-06  
Scope: restored WordPress database, WordPress filesystem backup, WP All Export archives, current Next.js application, generated WordPress snapshot, and live public-site reference.

## Executive findings

- The current Next.js application contains all 24 public content records identified in the restored database: 19 published pages and five published `asanja_safaris` records.
- The restored database contains 169 standard WordPress posts with status `draft` and two empty `auto-draft` records. All 169 now have validated local Sanity draft plans; none has been written to an external dataset because the owner-controlled project is not configured.
- The WP All Export archive contains 170 post rows: all 169 database drafts plus one CSV-only record, WordPress ID `37587`, which is no longer present in the restored database and requires owner review.
- Three CSV rows (IDs `75`, `170`, and `172`) are structurally malformed by embedded Elementor data. Their database records remain available, so the database must be authoritative and the CSV should be used only as a supplemental source for permalinks and author metadata.
- The source uploads tree contains 3,005 files. The production snapshot contains 221 selectively copied files and has no missing assets for the existing 24 public routes.
- The draft-post audit found 157 featured-image references, 148 unique featured attachments, 143 featured images with alt text, 14 without alt text, and one referenced featured attachment without a recovered file.
- Draft article bodies contain 132 `<img>` tags; 112 have a normal `src`. After matching those paths against the backup, 66 unique inline-image URLs across 26 posts remain unresolved. These must be recovered or explicitly accepted as missing before the article migration can be called complete.
- A standalone Sanity Studio, schema and owner-gated migration pipeline now exist in `studio/` and `migration/`. No real project ID, dataset credential, external import or Studio deployment is configured.

## Source hierarchy and authority

| Priority | Source | Location | Use |
|---|---|---|---|
| 1 | Restored WordPress database | `.local-mariadb/asanja` restored from `wordpress-source/database.sql` | Authoritative IDs, types, current status, title, slug, body, dates, relationships, postmeta and redirects |
| 2 | WordPress uploads | `wordpress-source/uploads` | Authoritative local media candidates and downloadable files |
| 3 | WP All Export post archive | `wordpress-source/uploads/wpallexport/exports/cadda307cd642ea6514414db76a089bc/Posts-Export-2026-June-10-0513.zip` | Supplemental historical permalinks, author fields and flat SEO/media fields |
| 4 | Raw site snapshot | `site-snapshot` | Published-page rendered markup and visual parity baseline |
| 5 | Live site | `https://asanjaafrica.com/` | Public visual and behavioural reference only; it cannot expose drafts |
| 6 | Current production snapshot | `public/legacy` | Existing migrated output; not a complete WordPress inventory source |

When sources conflict, the restored database controls content and current status. The export archive controls only fields not recoverable from the database after they have been validated.

## Current Next.js architecture

| Item | Finding | Status |
|---|---|---|
| Framework | Next.js 16.4.4, React 19.3.1, TypeScript, App Router | Existing |
| Public routing | `app/[[...path]]/route.ts` reads generated HTML from `public/legacy/<route>/index.html` | Existing |
| Form endpoint | `app/api/forms/route.ts` forwards validated submissions to an owner-configured webhook | Implemented; production webhook still required |
| Public content storage | Generated WordPress/Elementor HTML in `public/legacy` | Existing |
| Blog archive | `/blogs/` is an empty WordPress archive shell | Existing |
| Blog detail routes | No standard WordPress post detail routes | Missing by design until Sanity integration |
| Sanity Studio | Standalone Studio 6 source in `studio/` | Implemented locally; real project and deployment pending |
| Sanity client/schema | Typed schemas, Portable Text objects and drafts-only importer present | Implemented locally; external import pending |
| Sitemap | Static `public/sitemap.xml` with the 23 indexable public routes | Existing; must become dynamic when articles are published |

The catch-all raw-HTML route is suitable for preserving the existing marketing pages, but Sanity blog routes should be implemented as normal App Router pages and must be resolved before the legacy catch-all.

## Database content inventory

### Editorial content

| WordPress type | Status | Count | Migration status |
|---|---:|---:|---|
| `page` | Published | 19 | Migrated and verified |
| `page` | Draft | 3 | Requires manual owner review |
| `asanja_safaris` | Published | 5 | Migrated and verified |
| `post` | Draft | 169 | Validated local Sanity draft plans; external import pending |
| `post` | Auto-draft | 2 | Intentionally excluded unless meaningful content is later found; both are empty |
| `attachment` | Inherited | 650 | Metadata source; filesystem contains additional derivatives and unregistered files |
| `nav_menu_item` | Published | 12 | Main menu migrated in the preserved templates |
| `elementor_library` | Published | 21 | Preserved through the generated public templates where referenced |

### Non-public and plugin records

| Type | Status/count | Treatment |
|---|---:|---|
| `acf-field-group` / `acf-field` | 1 / 2 published | Schema-discovery source only; not public documents |
| `elementor_snippet` | 5 published, 3 draft | Requires security/manual review; not blog content |
| `wpcode` | 3 published, 2 trashed | Do not migrate into Sanity; review only for required runtime behaviour |
| `wpforms` | 5 published | Form-definition source; public form UI is already preserved separately |
| `metform-form` / `metform-entry` | 2 / 5 published | Plugin data; not public content |
| `everest_form` | 1 published | Plugin data; not public content |
| `sureforms_form` | 1 published | Plugin data; not public content |
| `whatsapp-accounts` | 1 published | Existing floating-control source; frontend behaviour already reconstructed |
| Revisions | 697 | Intentionally excluded from the first Sanity import; database retained for audit |

## Published route coverage

All routes below have generated HTML under `public/legacy` and are served by the current catch-all route.

| WP ID | Type | Current route | Status |
|---:|---|---|---|
| 9 | Page | `/` | Migrated and verified |
| 31 | Page | `/about/` | Migrated and verified |
| 33 | Page | `/contact/` | Migrated and verified |
| 414 | Page | `/privacy-policy/` | Migrated and verified |
| 433 | Child page | `/contact/thank-you/` | Migrated and verified; `noindex` |
| 1074 | Page | `/camps-and-lodges/` | Migrated and verified |
| 1076 | Page | `/safaris/` | Migrated and verified |
| 1078 | Page | `/make-a-booking/` | Migrated and verified |
| 1757 | Page | `/asanja-moru/` | Migrated and verified |
| 2601 | Page | `/asanja-sri-bustani/` | Migrated and verified |
| 2627 | Page | `/asanja-nyasirori/` | Migrated and verified |
| 2671 | Page | `/asanja-ruaha/` | Migrated and verified |
| 2692 | Page | `/asanja-under-the-stars/` | Migrated and verified |
| 2745 | Page | `/experiences/` | Migrated and verified |
| 2747 | Page | `/faqs/` | Migrated and verified |
| 2749 | Page | `/plan-my-stay/` | Migrated and verified |
| 3057 | Page | `/asanja-reviews/` | Migrated and verified |
| 37072 | Page | `/blogs/` | Migrated archive shell; requires Sanity listing implementation |
| 37383 | Page | `/terms/` | Migrated and verified |
| 4247 | Safari | `/asanja_safaris/tanzania-a-journey-through-natures-masterpieces/` | Migrated and verified |
| 4252 | Safari | `/asanja_safaris/from-i-do-to-dreams-come-true-the-perfect-honeymoon/` | Migrated and verified |
| 4253 | Safari | `/asanja_safaris/migration-madness/` | Migrated and verified |
| 4254 | Safari | `/asanja_safaris/wild-treasures-of-tanzania/` | Migrated and verified |
| 4255 | Safari | `/asanja_safaris/an-exclusive-safari-escape-a-family-or-friends-adventure-in-the-serengeti-with-just-3-tents-its-yours-alone/` | Migrated and verified |

### Draft pages requiring owner review

| WP ID | Title | Slug | Proposed treatment |
|---:|---|---|---|
| 2437 | Reviews - Trip advisor | `reviews` | Likely superseded by `/asanja-reviews/`; owner must confirm exclusion |
| 5126 | Elementor Page #5126 | Missing | Inspect content; likely test/orphan |
| 37070 | TEST | `test` | Exclude unless owner confirms business value |

## The 169 WordPress blog drafts

### Completeness

| Check | Result |
|---|---:|
| Database draft records | 169 |
| Non-empty titles | 169 |
| Non-empty article bodies | 169 |
| Existing slugs | 167 |
| Missing slugs | 2 (`Swahili`, ID 28352; `Endangered species of Tanzania`, ID 28353) |
| Non-empty excerpts | 45 |
| Missing excerpts | 124 |
| Featured-image references | 157 |
| Posts without featured-image reference | 12 |
| Unique featured attachments referenced | 148 |
| Featured images with stored alt text | 143 |
| Featured images without stored alt text | 14 |
| Featured attachment files unresolved | 1 (post 172, attachment 52) |
| Posts with at least one category relationship | 169 |
| Posts with at least one tag relationship | 143 |
| Posts without tag relationships | 26 |
| Earliest source date | 2018-03-01 12:55:24 |
| Latest source date | 2026-09-03 12:00:24 |

### Content-format signals

| Signal | Posts/occurrences | Migration implication |
|---|---:|---|
| Gutenberg block comments | 4 posts | Parse structurally before Portable Text conversion |
| Any shortcode syntax | 30 posts | Build shortcode allow-list and quality log |
| WPBakery `[vc_*]` content | 10 posts | Requires custom structural conversion or manual review |
| Elementor `_elementor_data` | 3 posts | Database JSON is authoritative for those records |
| Inline `<img>` | 52 posts / 132 tags | Convert to Portable Text image objects |
| Normal inline `src` values | 112 | Resolve through local media map |
| Unresolved inline image URLs | 66 unique URLs across 26 posts | Recover or record explicit migration exceptions |
| HTML tables | 32 posts | Preserve as structured table objects, not flattened text |
| iframe/embed signals | 0 posts | No special embed migration currently indicated |

### SEO fields available

The database uses Yoast SEO metadata, not Rank Math post metadata. Rank Math is present only for redirects.

| Field | Posts populated | Missing |
|---|---:|---:|
| Yoast SEO title | 164 | 5 |
| Yoast SEO description | 166 | 3 |
| Focus keyword | 148 | 21 |
| Estimated reading time | 166 | 3 |
| Primary category | 168 | 1 |
| Explicit canonical | 0 | 169 |
| Explicit Open Graph metadata | 0 | 169 |
| Explicit Twitter metadata | 0 | 169 |
| Explicit robots override | 0 | 169 |

Canonical and social fields must be generated from the approved route policy and featured image when source values are absent; they must not be invented inconsistently per article.

### Source conflicts and required quality flags

- Database: 169 drafts plus two empty auto-drafts.
- CSV: 170 post rows, including all 169 current drafts and CSV-only ID `37587`.
- CSV historical statuses: 162 `publish`, five `draft`, and three malformed values. These conflict with the newer/current database status and must not cause publication.
- CSV-only ID `37587` has no matching database record. It must be quarantined until the owner decides whether it is a deleted article that should be recovered.
- CSV rows 75, 170 and 172 have column shifts caused by large Elementor payloads. Database fields and direct postmeta must be used instead.

## Authors and editorial identities

The 169 drafts reference WordPress author IDs 5 (126 posts) and 7 (43 posts), but the current `wp_users` table only contains IDs 11, 12 and 13. The export preserves supplemental login data for IDs 5 and 7 (`sarkaria` and `deepak`), but it does not provide approved public author profiles.

Sanity must use separate `author` documents, not Sanity project-member records. Public names, biographies, portraits and attribution policy require owner confirmation. Email addresses from the export are private migration data and must never be rendered publicly or committed to the repository.

## Taxonomies

| Taxonomy | Terms | Draft-post usage |
|---|---:|---|
| Categories | 22 | 178 relationships across all 169 drafts |
| Tags | 213 | 769 relationships across 143 drafts |
| Navigation menu | 1 | 12 menu items |

The stored WordPress term `count` values are stale for many categories and all tags. Relationship tables, not cached term counts, must drive the Sanity import and validation.

## Media and downloads

| Item | Count/status |
|---|---:|
| Files under `wordpress-source/uploads` | 3,005 |
| Likely image/video/PDF media files | 2,879 |
| WordPress attachment records | 650 |
| Current public snapshot upload files | 221 |
| Missing referenced assets on existing 24 public routes | 0 |
| PDF attachment records | 3 |
| MP4 attachment records | 16 |
| QuickTime attachment records | 1 |

Recovered PDFs:

1. `wordpress-source/uploads/2024/05/AsanjaBooklet.pdf`
2. `wordpress-source/uploads/2025/05/Asanja-Brochure-2024-Compressed.pdf`
3. `wordpress-source/uploads/2025/07/Asanja-Brochure-2024.pdf`

Only assets actually referenced by migrated documents should be uploaded to Sanity. Original files should be deduplicated before upload; WordPress resized variants should not become separate canonical Sanity assets.

## Menus, redirects, forms and interactions

### Menus

- One WordPress menu named `Main Menu` with 12 items.
- The public header, footer and popup navigation are preserved in the generated templates.
- The Next.js compatibility layer restores popup, submenu, keyboard and link behaviour.

### Redirects

- Ten active Rank Math redirect groups contain 29 exact source paths.
- All 29 are implemented as 301 mappings in `app/[[...path]]/route.ts` and covered by `tools/check-redirects.mjs`.
- Article redirects cannot be finalized until the owner approves the blog URL policy and the 169 drafts have stable Sanity slugs.

### Forms

The database contains multiple historical form plugins and submission tables. Public form markup is already preserved, while delivery is handled by `app/api/forms/route.ts`.

| Source | Records |
|---|---:|
| Elementor submissions | 77 |
| WPForms definitions | 5 |
| WPForms entries | 288 |
| Fluent Forms definitions | 3 |
| Fluent Forms submissions | 0 |
| Formidable definitions | 3 |
| WS Form definitions | 2 |

Historical submissions contain personal data and are out of scope for Sanity. They must not be imported into the CMS or committed.

## Proposed source-to-Sanity mapping

| WordPress source | Sanity type | Key fields/relationships | Initial state |
|---|---|---|---|
| `post` | `article` document | Title, slug, excerpt, Portable Text body, dates, author, categories, tags, featured image, SEO, migration metadata | Draft document |
| Author IDs 5 and 7 | `author` document | Approved public name, slug, bio, portrait, original WP ID | Draft until owner confirms identity |
| `category` terms | `category` document | Name, slug, description, original term ID | Draft/imported reference data |
| `post_tag` terms | `tag` document | Name, slug, original term ID | Draft/imported reference data |
| Attachment references | Sanity image/file assets | Original file, alt, caption, credit, original attachment ID/path | Uploaded before article references |
| Yoast postmeta | Embedded `seo` object | Title, description, canonical, no-index, OG image/title/description | Embedded in article |
| Source provenance | Embedded `migrationMetadata` object | WP ID, legacy URL, source status, source type, quality flags, migrated timestamp | Hidden/read-only in Studio where practical |

Article bodies must be converted to Portable Text. Unsupported shortcodes, malformed source blocks and unresolved assets must produce per-document validation warnings; they must never be silently discarded.

## Migration plan and checkpoint

1. **Inventory (completed for first checkpoint):** reconcile database, CSV, files, current routes, taxonomies, authors, redirects and media signals.
2. **Owner decisions (blocked):** select/reuse a Sanity project and dataset, approve ownership, URL policy, author identities, CSV-only post handling, unresolved-asset policy and deployment target.
3. **Studio/schema (implemented locally):** standalone `studio/` application with article, author, category, tag, SEO, migration metadata, Portable Text image/table/shortcode objects and editorial structure.
4. **Deterministic extraction (implemented):** raw database/export snapshots write only to ignored `migration/extracted/`; source backups remain unchanged.
5. **Transformation (implemented):** authors/taxonomies/assets are planned before 169 articles using stable source keys and explicit quality flags.
6. **Dry-run validation (passed):** 169 transformed draft plans, zero external writes and zero publications; results are in `169-blog-post-migration-report.md`.
7. **Human checkpoint:** review schema, five representative transformed articles and quality report before any bulk Sanity write.
8. **Sanity import:** upload deduplicated assets, shared references and 169 drafts. Do not publish.
9. **Next.js integration:** add published-only blog listing/detail/category/tag routes, secured draft preview, metadata, sitemap filtering and revalidation.
10. **Cutover:** perform delta comparison, redirect crawl, broken-link check, responsive visual QA, production build and explicit owner-approved deployment.

## What can be implemented safely now

- Migration scripts and local ignored extraction/transformation directories (implemented).
- Sanity schema source files that use environment variables (implemented without inventing a project ID).
- Portable Text converters, asset manifest generation and dry-run validation.
- Next.js blog components and queries behind a configuration guard.
- Draft/published route tests, metadata tests, sitemap tests and redirect-generation tooling.

## What requires owner input or credentials

- Creating or selecting the Sanity project and dataset.
- Authenticating the Sanity CLI and assigning project members.
- Approving author profiles, the legacy URL policy, the CSV-only article and the three draft pages.
- Resolving or accepting missing source media.
- Configuring deployment URLs, CORS origins, preview token, webhook secret and production environment variables.
- Any production import, Studio deployment, website deployment, DNS change or publication.

The specific owner checklist is in `INFORMATION-REQUIRED-FROM-OWNER.md`.
