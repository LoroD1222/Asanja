import Image from 'next/image'
import type {SanityImage} from '../../sanity/types'

export function PageImage({image, className, priority = false, sizes = '(max-width: 700px) 100vw, 50vw'}: {image?: SanityImage; className?: string; priority?: boolean; sizes?: string}) {
  const asset = image?.asset
  if (!asset?.url) return null
  return <Image className={className} src={asset.url} alt={image?.alt || ''} width={asset.metadata?.dimensions?.width || 1200} height={asset.metadata?.dimensions?.height || 800} sizes={sizes} priority={priority} />
}
