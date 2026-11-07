# Missing Content and Assets

Updated: 2026-11-06

This file is the required consolidated checkpoint. The deeper source audit remains in `missing-content-and-media.md`.

## Content requiring a decision

- Three draft pages: WordPress IDs 2437, 5126 and 37070.
- CSV-only article ID 37587, absent from the authoritative restored database.
- Two draft articles without source slugs: IDs 28352 and 28353. Local candidates were generated only for validation and remain owner-review flags.
- Two legacy author identities (WordPress IDs 5 and 7) need approved public names, biographies and attribution policy.
- 124 articles have no source excerpt; no text was invented during transformation.
- Five articles lack a source SEO title and three lack a source SEO description.

## Media requiring recovery or acceptance

- One of 157 featured-image references points to an attachment/file that is not recovered.
- The complete transformed bodies contain 132 inline image occurrences.
- 82 inline image occurrences, representing 78 unique URLs across 32 articles, are not currently resolved to a local source file. This broader count includes normal `src`, lazy/data sources and external sources; the earlier source audit’s narrower normal-`src` count was 66 unique URLs across 26 posts.
- At least one unresolved source is a Wikimedia image and needs licensing/credit review.
- Four unresolved body image URLs use `images.openai.com`; their provenance and right to publish require manual verification.
- Missing alt text remains an explicit quality flag and must be completed before publication.

No missing image has been replaced with unrelated stock photography. Every unresolved reference remains visible in the ignored import plan and summarized in `169-blog-post-migration-report.md`.

