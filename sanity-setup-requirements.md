# Sanity Setup Requirements

Updated: 2026-11-06

## Current readiness

- Standalone Studio source: implemented in `studio/`.
- Schema and TypeScript checks: passing locally with Sanity 6.22.0.
- Local WordPress extraction/Portable Text dry run: passing for 169 drafts.
- Sanity project, dataset, members, CORS, tokens, hosted Studio and production import: not configured.

The complete owner decision list is in `INFORMATION-REQUIRED-FROM-OWNER.md`.

## Local prerequisites

- Node.js 22.12 or later (verified here with Node.js 24.18.0).
- npm.
- The preserved `wordpress-source/` and restored `.local-mariadb/` directories for rerunning extraction.
- An owner-approved Sanity project ID and dataset only when starting the Studio or performing external operations.

## Studio configuration

From `studio/`:

```bash
cp .env.example .env.local
npm install
npm run typecheck
npm run dev
```

Configure these non-secret values in `studio/.env.local`:

```text
SANITY_STUDIO_PROJECT_ID=<owner-approved-project-id>
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_ORIGIN=http://localhost:3000
```

Do not start the Studio with an invented project ID. Do not put write/read tokens in Studio-prefixed browser variables.

## Migration dry run

The dry run does not need Sanity credentials. Start the restored database with networking disabled and read-only mode, then run from `migration/`:

```bash
npm install
npm run dry-run
```

The default local settings are documented in `migration/.env.example`. Raw extraction, transformed article plans and machine reports are ignored by Git.

## Future secure environment values

After the project/dataset and hosting targets are approved:

| Variable | Scope | Secret |
|---|---|---:|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Next.js browser/server | No |
| `NEXT_PUBLIC_SANITY_DATASET` | Next.js browser/server | No |
| `SANITY_API_READ_TOKEN` | Next.js server, draft preview only | Yes |
| `SANITY_API_WRITE_TOKEN` | One-time controlled importer only | Yes |
| `SANITY_REVALIDATE_SECRET` | Next.js webhook endpoint | Yes |
| `SANITY_STUDIO_PROJECT_ID` | Studio browser configuration | No |
| `SANITY_STUDIO_DATASET` | Studio browser configuration | No |
| `SANITY_STUDIO_PREVIEW_ORIGIN` | Studio preview | No |

Secrets belong in ignored local files or the deployment provider’s encrypted environment store. They must not be pasted into chat, committed, placed in client bundles or embedded in Git remotes.

## Owner-approved launch sequence

1. Confirm project ownership, dataset, editor list and Studio URL.
2. Configure CORS for exact local/preview/production origins.
3. Authenticate the Sanity CLI interactively as an authorized member; do not share credentials.
4. Extract and validate the schema against the real project without importing content.
5. Review five representative transformations: classic HTML, Gutenberg, WPBakery/shortcode, Elementor and table-heavy.
6. Resolve author identities, slug candidates and the asset exception policy.
7. Run an importer dry run that reports create/patch/skip actions by WordPress ID.
8. Import shared taxonomies/authors, deduplicated assets and exactly 169 Sanity drafts.
9. Verify counts and references in Studio before connecting public routes.
10. Add secured preview and published-only frontend queries; deploy only after explicit approval.

