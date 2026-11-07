import createImageUrlBuilder, {type SanityImageSource} from '@sanity/image-url'
import {sanityEnv} from './env'

const builder = createImageUrlBuilder({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
})

export function urlForImage(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}
