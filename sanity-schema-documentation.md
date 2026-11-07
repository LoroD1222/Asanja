# Sanity Schema Documentation

Updated: 2026-11-06  
Implementation: `studio/src/schemaTypes/`

## Documents

### `article`

Primary editorial document for migrated and future blog posts.

| Group | Fields |
|---|---|
| Content | `title`, `slug`, `excerpt`, `body`, `featuredImage` |
| Taxonomy | `author`, `categories`, `tags`, `relatedArticles` |
| Workflow | `editorialStatus`, `scheduledAt`, `originalPublishedAt`, `sourceUpdatedAt`, `readingTimeMinutes` |
| SEO | embedded `seo` object |
| Migration | embedded read-only `migrationMetadata` object |

`editorialStatus` supports draft, awaiting review, approved and scheduled planning states. Actual public availability is still controlled by Sanity draft/published document state. The migration does not publish documents.

### `author`

Reusable public article identity with name, slug, Portable Text biography, portrait, original WordPress ID and an `identityApproved` review flag. The two recovered legacy identities remain unapproved until the owner supplies public names/profiles.

### `category` and `tag`

Reusable taxonomy documents with title, slug, description and original WordPress term ID. Relationships use Sanity references rather than copying taxonomy strings into each article.

## Objects

### `blockContent`

Portable Text body supporting:

- Paragraphs, H2, H3, H4 and block quotes.
- Bullet and numbered lists.
- Strong, emphasis, underline and strike-through decorators.
- Link annotations with URL and new-tab intent.
- `articleImage`, `articleTable`, `legacyShortcode` and `migrationNote` blocks.

Every array item receives a stable `_key` in the local transformation plan. Frontend queries must include `_key` for Visual Editing and React reconciliation.

### `articleImage`

Sanity image with hotspot/crop support plus alt text, caption, credit, original source URL and WordPress attachment ID. Alt text emits a Studio validation warning when missing rather than blocking the recovery of incomplete legacy drafts.

### `articleTable` / `tableRow`

Structured table data with an optional caption, header-row flag and ordered rows/cells. This prevents 32 table-heavy articles from being flattened into unreadable text.

### `legacyShortcode`

Read-only original shortcode name/raw value plus an editorial note. It makes unsupported WordPress/WPBakery structures visible and reviewable without executing legacy code.

### `migrationNote`

Read-only reason and original HTML for a source fragment that cannot yet be represented safely.

### `seo`

Optional SEO title, description, canonical URL, Open Graph title/description/image, focus keyword and no-index control. Public queries should use deterministic fallbacks and disable Stega encoding in `generateMetadata`.

### `migrationMetadata`

Read-only WordPress ID, type, status, source URL, modified/transformed times and quality flags. The WordPress ID is the idempotent lookup key; it is not copied into the Sanity `_id`.

## Studio structure

The Studio exposes All Articles, WordPress Imports, Awaiting Review, Scheduled and Published filtered lists, then Authors, Categories and Tags. “Published” is determined by actual Sanity document state, not the editorial status label.

## Validation policy

- Title, slug, body and editorial status are required.
- Slugs are lowercase letters, numbers and hyphens.
- Related articles, categories and tags must be unique.
- SEO title/description length warnings follow common search-result display limits.
- Image alt text is warned on because source gaps must remain importable and visible for review.
- Scheduling metadata is hidden unless the article status is `scheduled`; it does not activate scheduling by itself.

