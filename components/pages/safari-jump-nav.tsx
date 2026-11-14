'use client'

import {useEffect, useRef, useState} from 'react'

type JumpLink = {id: string; label: string}

export function SafariJumpNav({links}: {links: JumpLink[]}) {
  const navRef = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const targets = links.map(({id}) => ({id, element: document.getElementById(id)}))
      .filter((target): target is {id: string; element: HTMLElement} => Boolean(target.element))
    let frame = 0

    const updateActive = () => {
      frame = 0
      const readingLine = nav.getBoundingClientRect().bottom + 12
      let current: string | null = null

      for (const target of targets) {
        if (target.element.getBoundingClientRect().top > readingLine) break
        current = target.id
      }

      setActiveId((previous) => previous === current ? previous : current)
    }

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActive)
    }

    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, {passive: true})
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
    }
  }, [links])

  useEffect(() => {
    const nav = navRef.current
    if (!nav || !activeId || nav.scrollWidth <= nav.clientWidth) return
    const link = [...nav.querySelectorAll<HTMLAnchorElement>('a[data-section-id]')]
      .find((item) => item.dataset.sectionId === activeId)
    if (!link) return

    const navBounds = nav.getBoundingClientRect()
    const linkBounds = link.getBoundingClientRect()
    const inset = 16
    if (linkBounds.left < navBounds.left + inset) {
      nav.scrollTo({left: nav.scrollLeft + linkBounds.left - navBounds.left - inset, behavior: 'smooth'})
    } else if (linkBounds.right > navBounds.right - inset) {
      nav.scrollTo({left: nav.scrollLeft + linkBounds.right - navBounds.right + inset, behavior: 'smooth'})
    }
  }, [activeId])

  return <nav ref={navRef} className="safari-jump" aria-label="On this page">
    <span>Explore this journey</span>
    {links.map(({id, label}) => <a key={id} data-section-id={id} href={`#${id}`} className={activeId === id ? 'is-active' : undefined} aria-current={activeId === id ? 'location' : undefined}>{label}</a>)}
  </nav>
}
