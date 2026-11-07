# Sanity CMS Architecture

Updated: 2026-11-06  
Status: standalone Studio and local migration pipeline implemented; external project configuration and import intentionally blocked pending owner input.

## Architecture decision

The existing Next.js application remains the public website. Its 24 reconstructed WordPress/Elementor routes continue to be served from `public/legacy`; the CMS work does not replace or restyle those pages.

Sanity is introduced as a separate editorial system for blog content:

```text
Restored WordPress DB + uploads + WP All Export
                    |
                    v
       migration/scripts/extract-wordpress.mjs
                    |
         ignored source snapshot (171 records)
                    |
                    v
       migration/scripts/transform-to-sanity.mjs
                    |
       ignored import plan (169 article drafts)
                    |
                    v
       migration/scripts/validate.mjs
                    |
                    v
        human review and owner approval gate
                    |
           future idempotent Sanity import
                    |
                    v
     published-only Next.js blog routes + draft preview
```

No external Sanity write, project creation, dataset creation, Studio deployment, Next.js deployment or article publication is part of the current checkpoint.

## Repository layout

| Location | Responsibility |
|---|---|
| `studio/` | Standalone Sanity Studio 6 application and content schema |
| `studio/src/schemaTypes/` | Article, author, category, tag, SEO, provenance and Portable Text types |
| `studio/src/structure.ts` | Editor navigation for all, imported, review, scheduled and published articles |
| `studio/src/presentation/resolve.ts` | Future Presentation Tool locations for article and blog routes |
| `migration/scripts/extract-wordpress.mjs` | Read-only database/CSV/filesystem extraction |
| `migration/scripts/transform-to-sanity.mjs` | HTML-to-Portable-Text conversion and asset/reference planning |
| `migration/scripts/validate.mjs` | Count, safety, content and reference-plan validation |
| `migration/extracted/` | Ignored raw extraction; can contain unpublished content |
| `migration/transformed/` | Ignored import plan; can contain unpublished content |
| `migration/reports/` | Ignored machine-readable validation output |
| `169-blog-post-migration-report.md` | Committable count-only dry-run report |

## Content lifecycle

1. WordPress is read through a local Unix socket with networking disabled and the restored database in read-only mode.
2. Exactly 169 `post` records with WordPress status `draft` enter the article plan. The two empty `auto-draft` records are extracted for reconciliation but excluded from transformation.
3. Shared categories, tags and authors are planned before articles.
4. Article relationships use stable source keys during the dry run. A future importer must query explicit `wordpressId` fields, then use the real Sanity-generated IDs for references.
5. A rerun patches the matching source record rather than deriving IDs such as `post-123`; ordinary Sanity document IDs remain implementation details.
6. Imported articles must be created as Sanity drafts, retain `editorialStatus: draft`, and remain excluded from normal public queries and sitemaps.
7. Publication is an editor action after review, never an automatic migration step.

## Rich-text and asset strategy

- Paragraphs, H2-H4, quotes, strong/emphasis/underline/strike marks, links and lists become Portable Text blocks.
- Body H1 elements become H2 and receive a quality flag so the article page can retain one semantic H1.
- Tables become structured `articleTable` blocks with rows and cells.
- Images become `articleImage` plans carrying the source URL/path, attachment ID, alt text and caption. A future importer uploads the file first and replaces the plan with a real Sanity asset reference.
- WordPress shortcodes become explicit `legacyShortcode` blocks. They are not executed and are never silently discarded.
- Missing or unsupported source structures produce quality flags or `migrationNote` blocks.
- Source media are deduplicated at upload time; resized WordPress variants are not separate canonical assets unless they are the only recovered original.

## Security boundaries

- Studio project and dataset values come from environment variables.
- Read/write/preview tokens are never committed or exposed to client code.
- The local dry run requires no Sanity credential.
- Unpublished source content, raw exports and generated article plans are gitignored.
- Draft preview must use Next.js Draft Mode plus a server-only read token and an authenticated enable endpoint.
- Webhook revalidation must validate a server-only secret before revalidating article paths.

## Remaining integration work

- Select the owner-controlled Sanity project/dataset and configure CORS.
- Review representative transformed articles, author identities, two generated slugs and unresolved assets.
- Implement and run the idempotent asset/document importer against the approved dataset.
- Add published-only Next.js blog listing, detail, category and tag routes ahead of the legacy catch-all.
- Add secure Draft Mode preview, Portable Text renderers, image URL handling, dynamic metadata, sitemap filtering and webhook revalidation.
- Verify create/edit/publish/unpublish/preview workflows in the actual Studio before deployment.

