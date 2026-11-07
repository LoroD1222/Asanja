# Sanity Migration Pre-import Report

> Historical checkpoint: this report records the state before owner approval. The guarded import was subsequently approved and completed on 2026-11-07. See `FINAL-SANITY-MIGRATION-REPORT.md` for the verified final state.

Generated: 2026-11-07T06:34:54.113Z  
Project: `mduy4p4u`  
Dataset: `production`  
Status: **local validation passed; owner approval still required**

No Sanity documents were written, published, overwritten or deleted during this validation.

## Validation summary

| Check | Result |
|---|---:|
| WordPress database drafts | 169 |
| Article plans validated | 169 |
| Per-article validations passed | 169 |
| Per-article validations failed | 0 |
| Unique WordPress IDs / source keys / slugs | 169 / 169 / 169 |
| Source links / preserved links | 1368 / 1368 |
| Heading blocks | 2319 |
| Structured table blocks | 42 |
| List items | 5520 |
| Inline image blocks | 132 |
| Unique images recovered from exact sources | 7 |
| Unique unresolved image URLs | 71 |
| Missing source SEO titles / descriptions | 5 / 3 |
| Articles without featured-image metadata | 12 |
| Featured-image occurrences unresolved | 1 |
| Legacy shortcode blocks preserved for review | 239 |
| CSV-only records quarantined | 1 |
| Sanity writes / publications | 0 / 0 |

Each article preserves its source title, original slug where present, publication and modification dates, WordPress URL, excerpt, Yoast SEO fields, author/taxonomy source references, headings, lists, table cells, image source order and link destinations. Each plan also carries a SHA-256 integrity checksum of the original WordPress `post_content` value. Source `h1` elements are intentionally normalized to `h2` so an article page retains one page-level `h1`.

Sanity document IDs are not hardcoded in the local plans. The guarded importer generates unique draft IDs and uses the unique WordPress ID field for idempotent reruns; actual document-ID uniqueness can only be verified after the owner-approved import.

## Slugs awaiting owner approval

| WordPress ID | Title | Proposed slug | Original WordPress URL |
|---:|---|---|---|
| 28352 | Swahili | `swahili` | https://www.asanjaafrica.com/?p=28352 |
| 28353 | Endangered species of Tanzania | `endangered-species-of-tanzania` | https://www.asanjaafrica.com/?p=28353 |

## Import checkpoint

- The 169 records remain local draft import plans with `editorialStatus: draft` and `seo.noIndex: true`.
- CSV-only WordPress post `37587` remains quarantined and is not included.
- The importer refuses to run without both `--execute` and `--confirm-drafts-only` plus a server-only write token.
- Import is intentionally paused until the two proposed slugs and the import summary are approved.

## Verification performed

- Comprehensive local validation: passed for all 169 article plans.
- Migration safety tests: passed (2 test files, no failures).
- Next.js production build: passed.
- Standalone Sanity Studio production build: passed.
- Read-only Sanity query: zero article documents currently exist in `mduy4p4u / production`.
- Current CORS origins: localhost development origins only; production origin remains an owner action.

## Validation errors

- None.
