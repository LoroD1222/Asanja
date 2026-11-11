'use client'

import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

const menuLinks = [
  {label: 'Asanja Story', href: '/about/'},
  {label: 'Camps & Lodges', href: '/camps-and-lodges/'},
  {label: 'Safaris', href: '/safaris/'},
  {label: 'Experiences', href: '/experiences/'},
  {label: 'Asanja Reviews', href: '/asanja-reviews/'},
  {label: 'Journal', href: '/blogs/'},
  {label: 'FAQs', href: '/faqs/'},
  {label: 'Contact Us', href: '/contact/'},
]

export function AsanjaMenu() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return <div className={`asanja-menu${open ? ' is-open' : ''}`} ref={menuRef}>
    <button className="asanja-menu-button" type="button" aria-label="Toggle Asanja navigation" aria-expanded={open} aria-controls="asanja-menu-panel" onClick={() => setOpen((value) => !value)}>
      <span className="asanja-menu-icon" aria-hidden="true"><span/><span/><span/></span>
    </button>
    {open ? <nav className="asanja-menu-panel" id="asanja-menu-panel" aria-label="Asanja navigation">
      {menuLinks.map(({label, href}) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav> : null}
  </div>
}
