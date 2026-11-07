# 169 Blog Post Migration Report

Generated: 2026-11-06T17:25:31.321Z  
Stage: local extraction, Portable Text transformation and validation dry run  
External Sanity writes: **none**  
Articles published: **none**

## Result

Validation passed for the local import plan.

| Check | Count |
|---|---:|
| WordPress database drafts discovered | 169 |
| Draft article plans transformed | 169 |
| Articles actually imported into Sanity | 0 |
| Articles published | 0 |
| Plans with featured images | 157 |
| Plans without featured images | 12 |
| Featured images unresolved locally | 1 |
| Inline image blocks | 132 |
| Inline images unresolved locally | 75 |
| Unique unresolved inline image URLs | 71 |
| Articles with unresolved inline images | 31 |
| Missing source SEO titles | 5 |
| Missing source SEO descriptions | 3 |
| Articles with one or more quality flags | 56 |
| Preserved legacy shortcode blocks | 239 |
| Structured table blocks | 42 |
| Articles containing structured tables | 32 |
| Generated slug candidates awaiting approval | 2 |
| CSV-only records quarantined | 1 |

## Safety and idempotency

- Every article remains an unpublished import plan with `editorialStatus: draft` and `seo.noIndex: true`.
- The plan does not assign deterministic Sanity `_id` values. A future importer must query the explicit WordPress ID fields, patch an existing matching document, or create a document with a Sanity-generated ID.
- References are represented by stable source keys during the dry run. A future owner-approved import resolves those keys to actual Sanity document IDs after shared documents are created.
- Source HTML, uploads and the restored database are read-only inputs. Generated raw snapshots and article plans are gitignored because they contain unpublished content.

## Known review gates

- The two generated slug candidates require owner approval.
- Both recovered WordPress author identities require public-name/profile approval.
- Every unresolved featured or inline asset remains a visible quality flag.
- Legacy shortcode blocks are preserved rather than discarded and require representative editorial review before import.
- CSV-only WordPress ID 37587 remains quarantined until the owner chooses recovery or exclusion.

## Validation errors

- None.

## Validation warnings

- None.
