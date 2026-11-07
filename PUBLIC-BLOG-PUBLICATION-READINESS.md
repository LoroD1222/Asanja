# Asanja Africa Public Blog Publication Readiness

Date: 2026-11-07  
Sanity project: `mduy4p4u`  
Dataset: `production`

## Publication state

- Articles prepared: 169
- Draft articles: 169
- Published articles: 0
- Articles published during this work: 0
- Deployments performed: 0

Publication remains paused pending owner approval of `ARTICLE-PUBLICATION-PREVIEW.md`.

## Public integration completed

- `/blogs/` keeps the preserved WordPress/Elementor archive design and queries only published Sanity articles.
- Article cards use `/blogs/<slug>/` public URLs.
- `/blogs/<slug>/` renders Portable Text headings, paragraphs, lists, links, images, captions and tables.
- Category, tag and author routes are available below `/blogs/`.
- Related articles use explicit Sanity references first and fall back to shared categories or tags.
- Legacy singular `/blog/...` routes permanently redirect to `/blogs/...`.
- Stored WordPress source URLs are used by the legacy redirect resolver.
- Draft documents are excluded from public queries, archive listings, redirects and the sitemap.
- The dynamic sitemap includes only published articles whose `seo.noIndex` is not enabled.
- Canonical URLs, SEO title/description, Open Graph data and article JSON-LD are generated for public articles.

## Publication preview

The complete 169-row preview is available in three formats:

- `ARTICLE-PUBLICATION-PREVIEW.md`
- `migration/reports/article-publication-preview.html`
- `migration/reports/article-publication-preview.json`

Preview summary:

- Featured images available: 156
- Missing or unresolved featured images: 13
- Articles with at least one media warning: 44
- Every row is marked `Draft — not public`.

## Verification performed

| Check | Result |
|---|---|
| Next.js production build | Passed |
| Sanity Studio production build | Passed |
| Migration safety tests | Passed: 2/2 |
| `git diff --check` | Passed |
| `/blogs/` | HTTP 200; preserved archive shell and empty state rendered |
| `/blogs/?page=2` | HTTP 200; pagination request handled |
| Draft article URL | HTTP 404 |
| Legacy singular article route | HTTP 308 to plural route |
| `/sitemap.xml` | HTTP 200; no draft articles included |
| Related-article GROQ | Valid; published result count currently 0 |
| Desktop browser check | Passed at 1440 × 900 |
| Mobile browser check | Passed at 390 × 844 |
| Browser console | No warnings or errors |

## Remaining verification after approval

There are no published Sanity articles yet, so live article content, taxonomy result sets, populated pagination, related articles and public article metadata cannot be fully exercised end-to-end without publishing at least one approved article. After publication approval, run these checks against the approved set before any deployment.

Publishing must use Sanity's document publishing workflow. Approved articles must have `seo.noIndex` disabled before publication, while unapproved drafts must retain it. Referenced author, category and tag documents required by approved articles must also be published deliberately so their public routes and labels resolve correctly.

