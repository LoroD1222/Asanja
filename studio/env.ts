type RequiredStudioEnvName = 'SANITY_STUDIO_PROJECT_ID' | 'SANITY_STUDIO_DATASET'

export function requiredStudioEnv(name: RequiredStudioEnvName, rawValue: string | undefined) {
  const value = rawValue?.trim()

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy studio/.env.example to studio/.env.local and use the owner-approved Sanity value.`,
    )
  }

  return value
}

// Sanity replaces Studio environment variables statically in production.
// These references must stay explicit; dynamic access such as process.env[name]
// works in development but is not replaced in the deployed browser bundle.
export const projectId = requiredStudioEnv(
  'SANITY_STUDIO_PROJECT_ID',
  process.env.SANITY_STUDIO_PROJECT_ID,
)
export const dataset = requiredStudioEnv(
  'SANITY_STUDIO_DATASET',
  process.env.SANITY_STUDIO_DATASET,
)
export const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN?.trim() || 'http://localhost:3000'
