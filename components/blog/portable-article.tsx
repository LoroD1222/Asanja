import Image from 'next/image'
import Link from 'next/link'
import {PortableText, type PortableTextComponents} from 'next-sanity'
import type {Article, SanityImage} from '../../sanity/types'
import {pageHref} from '../../sanity/page-routes'

function safeHref(value: unknown) {
  const href = typeof value === 'string' ? value.trim() : ''
  if (href.startsWith('/') || href.startsWith('#')) return href
  try {
    const url = new URL(href)
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? href : '#'
  } catch {
    return '#'
  }
}

const components: PortableTextComponents = {
  types: {
    articleImage: ({value}) => {
      const image = value as SanityImage
      if (!image.asset?.url) return null
      const figure = (
        <figure className="article-inline-image">
          <Image
            src={image.asset.url}
            alt={image.alt || ''}
            width={image.asset.metadata?.dimensions?.width || 1400}
            height={image.asset.metadata?.dimensions?.height || 900}
            sizes="(max-width: 850px) 100vw, 850px"
          />
          {image.caption || image.credit ? (
            <figcaption>{image.caption}{image.credit ? ` — ${image.credit}` : ''}</figcaption>
          ) : null}
        </figure>
      )
      const href = safeHref(image.linkHref)
      if (image.linkHref && href !== '#') {
        const external = href.startsWith('http')
        return <a href={href} rel={external ? 'noopener noreferrer' : undefined}>{figure}</a>
      }
      return (
        figure
      )
    },
    articleTable: ({value}) => {
      const table = value as {caption?: string; hasHeaderRow?: boolean; rows?: Array<{_key?: string; cells?: string[]}>}
      const [head, ...rows] = table.rows || []
      const bodyRows = table.hasHeaderRow ? rows : table.rows || []
      return (
        <div className="article-table-scroll">
          <table>
            {table.caption ? <caption>{table.caption}</caption> : null}
            {table.hasHeaderRow && head ? <thead><tr>{head.cells?.map((cell, index) => <th key={index} scope="col">{cell}</th>)}</tr></thead> : null}
            <tbody>{bodyRows.map((row, rowIndex) => <tr key={row._key || rowIndex}>{row.cells?.map((cell, index) => <td key={index}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )
    },
    legacyShortcode: () => null,
    migrationNote: () => null,
  },
  marks: {
    internalLink: ({children, value}) => {
      const href = pageHref(value?.target)
      return href ? <Link href={href}>{children}</Link> : <span>{children}</span>
    },
    link: ({children, value}) => {
      const data = value as {href?: string; blank?: boolean}
      const href = safeHref(data?.href)
      const external = href.startsWith('http')
      return <a href={href} target={data?.blank ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{children}</a>
    },
  },
}

export function PortableArticle({body}: {body: Article['body']}) {
  if (!body?.length) return null
  return <div className="article-body"><PortableText value={body} components={components} /></div>
}
