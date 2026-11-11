import Link from 'next/link'
import {PortableText, type PortableTextComponents} from 'next-sanity'
import type {PageText} from '../../sanity/page-types'
import {pageHref, safeExternalHref} from '../../sanity/page-routes'

const components: PortableTextComponents = {
  marks: {
    internalLink: ({children, value}) => {
      const href = pageHref(value?.target)
      return href ? <Link href={href + (value?.fragment ? `#${value.fragment}` : '')}>{children}</Link> : <span>{children}</span>
    },
    externalLink: ({children, value}) => {
      const href = safeExternalHref(value?.href)
      return href ? <a href={href} target={value?.blank ? '_blank' : undefined} rel={value?.blank ? 'noopener noreferrer' : undefined}>{children}</a> : <span>{children}</span>
    },
  },
}

export function PortablePageText({value}: {value?: PageText}) {
  return value?.length ? <div className="safari-prose"><PortableText value={value} components={components} /></div> : null
}
