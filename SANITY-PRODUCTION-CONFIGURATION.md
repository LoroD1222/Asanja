# Asanja Africa Sanity Production Configuration

Verified: 2026-11-06  
Sanity project: `mduy4p4u`  
Dataset: `production`

No credentials are included in this report. Do not paste tokens into chat, source files, or Git history.

## Current verified state

- The Next.js application and standalone Studio both target `mduy4p4u / production`.
- The dataset contains **169 article drafts and zero published articles** following the approved guarded import on 2026-11-07.
- Current Sanity CORS origins are `http://localhost:3000` and `http://localhost:3333`.
- The production website hostname and deployed Studio hostname have not been supplied, so production CORS and preview origins cannot yet be finalized safely.

## Required production environment values

### Next.js hosting environment

| Variable | Exposure | Required value/action |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Public | `mduy4p4u` |
| `NEXT_PUBLIC_SANITY_DATASET` | Public | `production` |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | Public | The deployed standalone Studio URL, once chosen |
| `SANITY_API_READ_TOKEN` | Server-only secret | A Sanity token with **Viewer** access, required only for draft preview |
| `SANITY_REVALIDATE_SECRET` | Server-only secret | A newly generated high-entropy webhook signing secret |

Published pages use the published perspective and do not require a read token. The Viewer token is read server-side only when Next.js Draft Mode is enabled.

### Standalone Studio environment

| Variable | Exposure | Required value/action |
|---|---|---|
| `SANITY_STUDIO_PROJECT_ID` | Public Studio config | `mduy4p4u` |
| `SANITY_STUDIO_DATASET` | Public Studio config | `production` |
| `SANITY_STUDIO_PREVIEW_ORIGIN` | Public Studio config | The final production website origin, for example `https://your-real-hostname.example` only after the real hostname is confirmed |

The current draft-preview integration uses Sanity Presentation and `next-sanity`'s `defineEnableDraftMode`. It validates the signed preview request and uses the server-only Viewer token. There is no separate static draft-preview secret environment variable in this implementation; inventing one would create an unused credential. If a custom preview-secret protocol is desired later, it should be implemented deliberately in both Studio and Next.js.

### One-time migration environment

| Variable | Exposure | Required value/action |
|---|---|---|
| `SANITY_PROJECT_ID` | Local/server-only | `mduy4p4u` |
| `SANITY_DATASET` | Local/server-only | `production` |
| `SANITY_API_WRITE_TOKEN` | Local/server-only secret | A short-lived token with sufficient create/update asset and document permissions |

Store the migration token only in the ignored `migration/.env.local` or an ephemeral process environment. Revoke it after the approved import. The guarded importer will still require both `--execute` and `--confirm-drafts-only`.

## Owner actions required before production use

1. Confirm the exact public production website origin, including `https://` and whether `www` is canonical.
2. Confirm the deployed Studio origin, if the Studio will be hosted.
3. In Sanity Manage for project `mduy4p4u`, create a Viewer token. Add it directly to the secure environment settings of the Next.js host as `SANITY_API_READ_TOKEN`; do not send it through chat.
4. Generate a high-entropy webhook secret in a password manager. Add it directly to the Next.js host as `SANITY_REVALIDATE_SECRET`.
5. In Sanity Manage → API → CORS origins, add the exact production website origin with credentials enabled. Add the deployed Studio origin if required. Keep localhost entries only if local development remains needed.
6. Configure a Sanity webhook for article, author, category and tag mutations. Send signed `POST` requests to `https://<production-host>/api/revalidate/sanity/` using the same webhook secret.
7. Set `SANITY_STUDIO_PREVIEW_ORIGIN` to the confirmed production website origin and rebuild the standalone Studio.
8. Revoke the short-lived migration write token used for the completed import. It is no longer required for normal website or Studio operation.

## Security notes

- Only project ID, dataset and Studio URL belong in public variables.
- Viewer, migration and webhook secrets must never use a `NEXT_PUBLIC_` or `SANITY_STUDIO_` prefix.
- Do not commit `.env.local` files.
- Do not grant the long-lived website Viewer token write permissions.
- Do not configure production CORS with a wildcard origin.
