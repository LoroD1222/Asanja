# Asanja Africa Blog Publication Verification

Generated: 2026-11-07  
Sanity project: `mduy4p4u`  
Dataset: `production`

No article was published, no imported document was modified, and no deployment was performed.

## Sanity Studio and content audit

The authenticated Studio-context audit completed successfully against the raw Sanity perspective.

| Check | Result |
|---|---:|
| Article documents | 169 |
| Draft articles | 169 |
| Published articles | 0 |
| Unique WordPress IDs | 169 |
| Unique slugs | 169 |
| Articles with `noIndex` enabled | 169 |
| Authors | 2 |
| Categories | 22 |
| Tags | 213 |
| Sanity image assets | 172 |
| Broken document or image references | 0 |
| Quarantined post 37587 present | No |

The Studio and Next.js environment configuration both resolve to `mduy4p4u / production`.

## Card and route data

- All 169 remote titles and slugs match the prepared WordPress import.
- All stored excerpts match the prepared import.
- 45 articles have a WordPress excerpt.
- 124 articles have no stored WordPress excerpt; their cards intentionally omit excerpt text instead of inventing content.
- 156 articles have a valid featured-image reference backed by an existing Sanity asset.
- 13 articles have no usable featured image.
- Related-article fallback was exercised against draft data and returned three valid articles sharing categories or tags.
- Category, tag and author references resolve without broken references.

The public archive is available at `http://127.0.0.1:3000/blogs/`. It preserves the existing WordPress/Elementor header, hero, typography, spacing, footer, interactions and responsive behavior. Because every article is still a draft, the public archive correctly renders the empty state and public article/taxonomy routes return 404.

Route checks:

| Route | Result |
|---|---|
| `/blogs/` | 200 |
| Draft `/blogs/<slug>/` | 404, as required |
| Draft category route | 404, as required |
| Draft tag route | 404, as required |
| Legacy `/blog/<slug>/` | 308 to `/blogs/<slug>/` |

The archive was checked at desktop and 390 × 844 mobile widths. A narrowly scoped mobile heading-wrap correction was applied to prevent archive headings from overflowing. Browser console checks returned no warnings or errors.

## Missing featured images

| WP ID | Article |
|---:|---|
| 75 | Wildebeest Migration Serengeti |
| 100 | Experiences & Activities |
| 170 | Tanzania National Park Fees 2025 \| Complete Guide to Park Entry Costs |
| 172 | Fly Camping Serengeti |
| 28342 | Arusha National Park |
| 28344 | Balloon Safari Serengeti |
| 28345 | Tanzania Big 5 Safaris |
| 28347 | Experience Asanja Grumeti Camp |
| 28348 | Ruaha National park |
| 28349 | Kilimanjaro National Park |
| 28351 | The Great Migration |
| 28352 | Swahili |
| 28353 | Endangered species of Tanzania |

WordPress post 172 is the one unresolved featured attachment: attachment ID 52 is absent from the available backup. The other 12 have no prepared featured image. The full media audit records 75 unresolved inline-image occurrences across 31 articles plus the unresolved featured image. No unrelated image was substituted.

## Link audit

All 1,368 preserved content-link occurrences were inspected.

| Link state | Count |
|---|---:|
| Resolved internal links | 325 |
| Preserved external links | 1,001 |
| Unmapped internal links | 42 |
| Invalid URL values | 0 |
| Articles affected by unmapped links | 25 |

The 42 unmapped links point primarily to legacy `demo.asanjaafrica.com` routes such as old Serengeti, Ngorongoro, Tarangire, camp-overview and safari-planning pages. They are preserved in the article body but do not yet have verified destination mappings. See `ARTICLE-LINK-AUDIT.md` for every source article and URL.

## Verification completed

- Next.js production build: passed.
- Sanity Studio production build: passed.
- Studio TypeScript check: passed.
- Migration safety tests: 2/2 passed.
- Git whitespace/error check: passed.
- Authenticated raw Studio audit: passed with zero failures.
- Public desktop and mobile browser checks: passed.
- Public browser console: no warnings or errors.

## Remaining before publication

1. Review the complete 169-row publication preview.
2. Decide whether the 13 articles without featured images may publish without one or should remain held.
3. Review the 75 unresolved inline-image occurrences. Missing content is preserved as migration notes and was not discarded.
4. Approve redirect targets or content-link corrections for the 42 unmapped internal links.
5. Decide whether the 124 articles without an original excerpt should continue without one or receive editor-written excerpts. No excerpt should be generated automatically.
6. Configure a server-only Sanity Viewer token as `SANITY_API_READ_TOKEN` in the root `.env.local` to enable authenticated Next.js Draft Mode and Studio Presentation previews. Do not send the token through chat.
7. Approve a publication set. Publishing must deliberately publish required author/category/tag dependencies and disable `seo.noIndex` only for approved articles.
8. After publication, repeat populated archive, pagination, article, category, tag, related-content, metadata and sitemap tests before any deployment.

