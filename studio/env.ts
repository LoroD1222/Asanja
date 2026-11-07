export function requiredStudioEnv(name: 'SANITY_STUDIO_PROJECT_ID' | 'SANITY_STUDIO_DATASET') {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `Missing ${name}. Copy studio/.env.example to studio/.env.local and use the owner-approved Sanity value.`,
    )
  }

  return value
}

export const projectId = requiredStudioEnv('SANITY_STUDIO_PROJECT_ID')
export const dataset = requiredStudioEnv('SANITY_STUDIO_DATASET')
export const previewOrigin =
  process.env.SANITY_STUDIO_PREVIEW_ORIGIN?.trim() || 'http://localhost:3000'
