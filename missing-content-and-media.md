# Missing Content and Media

Audit date: 2026-11-06

## Article content

- All 169 database draft posts have non-empty titles and non-empty bodies.
- 124 posts have no excerpt. Excerpts may be left empty in Sanity or deterministically derived only after owner approval; they must not be presented as original source excerpts.
- Two posts have no slug: IDs 28352 and 28353.
- Three CSV records are malformed, but the corresponding database records remain available.
- One additional CSV-only record, ID 37587, has no database record and requires manual review.

## Featured images

| Check | Result |
|---|---:|
| Posts with featured-image references | 157 |
| Posts without featured-image references | 12 |
| Unique featured attachments | 148 |
| Featured images with stored alt text | 143 |
| Featured images missing stored alt text | 14 |
| Referenced featured files unresolved | 1 |

The unresolved featured file is attachment ID 52 referenced by post ID 172. No unrelated replacement may be used.

## Inline images

- Article bodies contain 132 `<img>` tags across 52 posts.
- 112 tags expose a normal `src` value.
- 66 unique WordPress upload URLs across 26 posts cannot currently be matched to files in the recovered uploads tree.
- One external Wikimedia image is referenced and requires a licensing/attribution review before any asset copy.

Every unresolved inline image must become a per-article migration warning. The Portable Text converter must preserve its position and metadata when the file is recovered; it must not silently remove the block.

## Source media library

- Files under `wordpress-source/uploads`: 3,005.
- Likely image/video/PDF files: 2,879.
- WordPress attachment records: 650.
- Selectively copied public-snapshot media: 221.
- Missing assets referenced by the existing 24 public routes: zero.
- PDF downloads recovered: three.

The article migration needs a separate deduplicated asset manifest. Original files should be preferred over WordPress size variants, and only referenced assets should be uploaded to Sanity.

## SEO gaps in the 169 drafts

| Field | Missing |
|---|---:|
| Yoast title | 5 |
| Yoast description | 3 |
| Focus keyword | 21 |
| Reading time | 3 |
| Primary category | 1 |
| Explicit canonical | 169 |
| Explicit Open Graph metadata | 169 |

Fallback values must be deterministic and flagged for editorial review before publication.

## Author gaps

The post records reference author IDs 5 and 7, but those users are absent from the restored `wp_users` table. The export preserves private login/email information, which must not be exposed. Approved public author documents are required from the owner.
