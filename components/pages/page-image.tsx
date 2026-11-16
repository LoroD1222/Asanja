import Image from 'next/image'
import type {SanityImage} from '../../sanity/types'

export function PageImage({image, className, priority = false, quality = 75, sizes = '(max-width: 700px) 100vw, 50vw'}: {image?: SanityImage; className?: string; priority?: boolean; quality?: 75 | 90; sizes?: string}) {
  const asset = image?.asset
  if (!asset?.url) return null
  return <Image
    className={className}
    src={asset.url}
    alt={image?.alt || ''}
    width={asset.metadata?.dimensions?.width || 1200}
    height={asset.metadata?.dimensions?.height || 800}
    sizes={sizes}
    quality={quality}
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'}
  />
}
