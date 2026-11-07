# Asanja Africa Sanity integration — pre-import report

Date verified: 2026-11-06  
Sanity project: **Asanja Africa CMS** (`mduy4p4u`)  
Dataset: **production**

## Safety status

- No WordPress articles have been imported.
- No Sanity documents or assets have been created, changed, published or deleted by the migration.
- The dataset still contains `0` article documents, `0` draft articles and `0` published articles.
- The migration importer was run without execution flags and reported `0` external reads, `0` external writes and `0` publications.
- No API token is stored in tracked source files. Local environment files are ignored by Git.

## Existing applications identified

- The existing Next.js App Router application is at the repository root.
- The existing standalone Sanity Studio is in `studio/`.
- The existing WordPress-to-Sanity migration is in `migration/`.
- The existing legacy WordPress-rendered pages remain in `public/legacy/` and continue to be served by `app/[[...path]]/route.ts`.

No replacement Next.js application or replacement Studio was created.

## Final configuration

### Next.js

The root application reads these values from the deployment environment:

```dotenv
NEXT_PUBLIC_SANITY_PROJECT_ID=mduy4p4u
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_STUDIO_URL=http://localhost:3333
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=
```

The project ID, dataset and Studio URL are public configuration. `SANITY_API_READ_TOKEN` and `SANITY_REVALIDATE_SECRET` are server-only secrets and must be added through encrypted local/deployment environment settings. They must not use a `NEXT_PUBLIC_` prefix.

Public queries use the `published` perspective and explicitly exclude IDs under `drafts.**`. Draft preview cannot be enabled unless a server-only Viewer token is present and the signed Sanity preview URL validates successfully.

Implemented public content routes:

- `/blogs/` — Sanity article listing inserted into the existing WordPress-designed journal page.
- `/blog/[slug]/` — individual article.
- `/blog/category/[slug]/` — category archive.
- `/blog/tag/[slug]/` — tag archive.
- `/blog/author/[slug]/` — author profile and articles.

Article pages include SEO metadata, canonical URL support, Open Graph metadata, JSON-LD, semantic headings, image alt text, publication date, reading time, author, categories, tags, Portable Text, tables and related articles.

The Next.js image allowlist is restricted to `https://cdn.sanity.io` for Sanity-hosted images.

### Sanity Studio

The existing Studio reads:

```dotenv
SANITY_STUDIO_PROJECT_ID=mduy4p4u
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
```

The authenticated Studio CLI confirmed:

- workspace: `asanjaAfrica`
- project ID: `mduy4p4u`
- dataset: `production`
- access role: administrator

The Studio schema, structure, Vision and Presentation tools remain in the existing Studio. Article Presentation links now resolve to `/blog/[slug]/`.

Configured Sanity CORS origins:

- `http://localhost:3333` — standalone Studio.
- `http://localhost:3000` — local Next.js Presentation/Visual Editing preview, with credentials enabled.

The production website origin must be added when its final deployment hostname is known.

### Migration

The existing import remains drafts-only and idempotent by WordPress ID:

- execution still requires both `--execute` and `--confirm-drafts-only`;
- an ignored `SANITY_API_WRITE_TOKEN` is required at execution time;
- preflight aborts if a matching published document already exists;
- all imported documents use `drafts.*` IDs;
- articles retain `editorialStatus: draft` and `seo.noIndex: true`;
- image assets are reused by SHA-1 when possible;
- reruns patch matching WordPress drafts rather than duplicating them.

All 169 prepared articles now retain their original WordPress path in `migration.sourcePath`. Published legacy article URLs are resolved through that field (or exact original URL/WordPress ID) and redirected to `/blog/[slug]/`. Draft URLs are not resolved publicly.

## Pre-import content and media review

The dry-run plan passed validation with:

- 169 prepared article drafts;
- 2 authors;
- 22 categories;
- 213 tags;
- 169/169 articles marked `draft`;
- 169/169 articles marked `noIndex: true`;
- 169/169 articles with a preserved WordPress source path;
- 157 featured images found;
- 12 articles without featured images;
- 1 unresolved featured image;
- 132 inline image occurrences;
- 82 unresolved inline image occurrences representing 78 unique URLs across 32 articles;
- 2 generated slugs requiring owner approval;
- 1 CSV-only record kept in quarantine;
- 245 legacy shortcode blocks retained for editorial review;
- 42 table blocks across 32 articles.

These unresolved media and editorial decisions should be cleared or explicitly accepted before import. They do not block the application connection itself.

## Verification results

### Successful checks

- Next.js production build: passed.
- Next.js TypeScript check (included in production build): passed.
- Studio TypeScript check: passed.
- Studio schema extraction and TypeGen: passed; 5 queries and 28 schema types generated.
- Standalone Studio production build: passed.
- Migration tests: passed.
- Migration transform: passed with 169 articles.
- Migration validation: passed with no errors or warnings.
- Authenticated Studio dataset query: passed.
- Anonymous published dataset query used by Next.js: passed.

### Production-server route checks

| Route | Result |
|---|---:|
| `/` | 200 |
| `/about/` | 200 |
| `/blogs/` | 200; original page shell plus Sanity empty state |
| `/blog/definitely-unpublished/` | 404 |
| `/wildlife/unpublished-test/` | 404 |
| `/api/draft-mode/enable/` without Viewer token | 503, intentionally closed |
| `POST /api/revalidate/sanity/` without webhook secret | 503, intentionally closed |

## Required owner/deployment values before full preview or import

1. Create a Sanity **Viewer** token and store it as `SANITY_API_READ_TOKEN` in the Next.js server environment to enable secure draft preview.
2. Create a strong webhook secret, store it as `SANITY_REVALIDATE_SECRET`, and configure a Sanity document webhook to `POST /api/revalidate/sanity/` with that secret.
3. Provide the production Next.js origin so it can be added to Sanity CORS and used as the Studio preview origin.
4. Resolve or approve the outstanding media references and the two generated slugs.
5. Only after reviewing this report, explicitly approve the drafts-only import and provide a short-lived Editor/write token through an ignored environment variable.

No import command with execution flags has been run.
