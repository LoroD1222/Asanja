// Sanity replaces Studio environment variables statically in production.
// These references must stay explicit; dynamic access such as process.env[name]
// works in development but is not replaced in the deployed browser bundle.
// The fallbacks are public, owner-verified identifiers for this Asanja project.
export const projectId = process.env.SANITY_STUDIO_PROJECT_ID?.trim() || 'mduy4p4u'
export const dataset = process.env.SANITY_STUDIO_DATASET?.trim() || 'production'
export const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN?.trim() || 'http://localhost:3000'
