'use client'

import {useState} from 'react'
import type {SanityImage} from '../../sanity/types'
import {PageImage} from './page-image'

type Highlight = {_key: string; title: string; description?: string}

export function TripHighlights({items, images}: {items: Highlight[]; images: SanityImage[]}) {
  const [active, setActive] = useState(0)
  const selectedImage = images.length ? images[active % images.length] : undefined

  return <div className={`safari-highlights${images.length ? '' : ' safari-highlights--text-only'}`}>
    {selectedImage ? <div className="safari-highlights-visual"><PageImage image={selectedImage} className="safari-highlights-image" sizes="(max-width: 800px) 100vw, 48vw" /><span className="safari-highlights-count">{String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></div> : null}
    <div className="safari-highlights-list" role="group" aria-label="Safari highlights">
      {items.map((item, index) => <div className={`safari-highlights-item${active === index ? ' is-active' : ''}`} key={item._key}>
        <button type="button" aria-expanded={active === index} onClick={() => setActive(index)}>
          <span className="safari-highlights-number">{String(index + 1).padStart(2, '0')}</span>
          <span className="safari-highlights-title">{item.title}</span>
          <span className="safari-highlights-indicator" aria-hidden="true">{active === index ? '−' : '+'}</span>
        </button>
        {active === index && item.description ? <p id={`safari-highlight-${item._key}`}>{item.description}</p> : null}
      </div>)}
    </div>
  </div>
}
