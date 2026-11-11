import type {ValidationContext} from 'sanity'

type Reference = {_ref?: string}

export async function validatePublishedReferences(references: Reference[] | undefined, context: ValidationContext) {
  const ids = (references || []).map((reference) => reference?._ref?.replace(/^drafts\./, '')).filter((id): id is string => Boolean(id))
  if (new Set(ids).size !== ids.length) return 'Remove duplicate references.'
  const selfId = context.document?._id?.replace(/^drafts\./, '')
  if (selfId && ids.includes(selfId)) return 'A page cannot link to itself.'
  if (!ids.length) return true
  const client = context.getClient({apiVersion: '2026-11-06'}).withConfig({perspective: 'published'})
  const published = await client.fetch<string[]>('*[_id in $ids && defined(slug.current) && publicationStatus != "hidden"]._id', {ids})
  const available = new Set(published)
  return ids.every((id) => available.has(id)) || 'One or more linked pages are unpublished, hidden or missing a slug.'
}

export async function validateUniqueSlug(slug: {current?: string} | undefined, context: ValidationContext) {
  if (!slug?.current) return 'A slug is required.'
  if (!/^[a-z0-9-]+$/.test(slug.current)) return 'Use lowercase letters, numbers and hyphens.'
  const id = context.document?._id?.replace(/^drafts\./, '')
  const count = await context.getClient({apiVersion: '2026-11-06'}).fetch<number>(
    'count(*[_type == $type && slug.current == $slug && _id != $id && _id != $draftId])',
    {type: context.document?._type || '', slug: slug.current, id: id || '', draftId: `drafts.${id || ''}`},
  )
  return count === 0 || 'This slug is already used by another document of this type.'
}
