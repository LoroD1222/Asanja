# Missing Pages and Routes

Audit date: 2026-11-06

## Published coverage

No published WordPress page or published `asanja_safaris` record is missing from the current Next.js snapshot. The 19 published pages and five published safari records all have generated HTML and current routes.

## Routes not yet implemented

| Source | Count | Current state | Required action |
|---|---:|---|---|
| Standard WordPress draft posts | 169 | No public or preview Next.js routes | Import into Sanity as drafts; add secure preview; expose only after individual publication |
| Blog listing | 1 | `/blogs/` is a static empty WordPress shell | Replace its article data region with a published-only Sanity listing while preserving the design |
| Article details | Up to 169 future routes | Missing | Implement App Router article rendering from Sanity with approved legacy URL policy |
| Category archives | 22 possible categories | Missing | Implement only for categories used by published Sanity articles |
| Tag archives | 213 possible tags | Missing | Implement only if owner confirms tags are a public navigation requirement |
| Draft pages | 3 | Intentionally absent | Owner review; do not expose automatically |
| CSV-only post ID 37587 | 1 | Not in database or Next.js | Quarantine pending owner decision |

## Unresolved routing decisions

- Two draft posts lack slugs: IDs 28352 and 28353.
- Historical exported permalinks use multiple category-based paths, while the proposed CMS could use `/blogs/<slug>/`. The owner must approve preserve-versus-redirect policy.
- Drafts must not appear in normal public routes, public Sanity queries or the sitemap.
- The current catch-all `app/[[...path]]/route.ts` must not intercept new component-based blog routes. Explicit App Router blog/article/category/tag routes must take precedence.

## Existing redirects

The ten Rank Math redirect groups contain 29 exact source paths. They are implemented and tested in the current Next.js route handler. Blog redirect generation remains pending until article routes are approved.
