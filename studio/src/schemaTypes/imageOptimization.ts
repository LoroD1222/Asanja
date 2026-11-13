import type {ImageRule, ValidationContext} from 'sanity'

type ImageValue = {
  asset?: {
    _ref?: string
  }
}

type ImageAssetDetails = {
  size?: number
  width?: number
  height?: number
}

export const imageUploadGuidance =
  'Before uploading, compress photos to JPG or WebP, keep the longest edge at 2400px or less, and aim for a file under 1 MB. The website serves responsive compressed versions automatically.'

export function imageOptimizationWarning(rule: ImageRule) {
  return rule.custom(async (value: unknown, context: ValidationContext) => {
    const assetId = (value as ImageValue | undefined)?.asset?._ref
    if (!assetId) return true

    try {
      const asset = await context
        .getClient({apiVersion: '2026-11-11'})
        .fetch<ImageAssetDetails>(
          '*[_id == $assetId][0]{size, "width": metadata.dimensions.width, "height": metadata.dimensions.height}',
          {assetId},
        )
      const longestEdge = Math.max(asset?.width || 0, asset?.height || 0)
      const megabytes = (asset?.size || 0) / 1_000_000

      if (megabytes > 2 || longestEdge > 4000) {
        return `This source image is ${megabytes.toFixed(1)} MB at ${asset?.width || '?'} × ${asset?.height || '?'} px. Compress it before use (target: under 1 MB and no more than 2400px on the longest edge).`
      }
    } catch {
      // A temporary asset lookup failure should never block an editor from saving.
    }

    return true
  }).warning()
}
