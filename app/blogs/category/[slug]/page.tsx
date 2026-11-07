import type {Metadata} from 'next'
import {TaxonomyPage} from '../../../../components/blog/taxonomy-page'

export const metadata: Metadata = {title: 'Article category'}

export default async function CategoryPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params
  return <TaxonomyPage type="category" slug={slug} label="Category" />
}
