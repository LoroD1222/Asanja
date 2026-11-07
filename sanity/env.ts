const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID')
}

if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET')
}

export const sanityEnv = {
  projectId,
  dataset,
  apiVersion: '2026-11-06',
  studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim() || 'http://localhost:3333',
}
