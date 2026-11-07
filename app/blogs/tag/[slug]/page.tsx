import type {Metadata} from 'next'
import {TaxonomyPage} from '../../../../components/blog/taxonomy-page'

export const metadata: Metadata = {title: 'Article tag'}

export default async function TagPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  return <TaxonomyPage type="tag" slug={slug} label="Topic" />
}
