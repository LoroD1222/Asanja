// Public, owner-verified identifiers for this single-project site. Deployment
// environment variables can override them when targeting another Sanity project.
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || 'mduy4p4u'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || 'production'

export const sanityEnv = {
  projectId,
  dataset,
  apiVersion: '2026-11-06',
  studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim() || 'http://localhost:3333',
}
