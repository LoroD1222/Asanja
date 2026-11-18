'use client'

import {useEffect, useRef, useState} from 'react'
import {campLinks, siteMenuLinks} from './asanja-site-data'

function isCurrentPath(pathname: string, href: string) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  return normalized === href || (href === '/blogs/' && normalized.startsWith('/blogs/'))
}

export type CmsMenuLink = {label: string; href: string}

export function AsanjaMenu({
  cmsCampLinks = [],
  cmsSafariLinks = [],
  currentPath = '',
}: {
  cmsCampLinks?: CmsMenuLink[]
  cmsSafariLinks?: CmsMenuLink[]
  currentPath?: string
}) {
  const pathname = currentPath
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const openButtonRef = useRef<HTMLButtonElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const allCampLinks = [...campLinks, ...cmsCampLinks].filter((item, index, items) => items.findIndex(({href}) => href === item.href) === index)
  const menuLinks = siteMenuLinks.map((item) => {
    if (item.href === '/camps-and-lodges/') return {...item, children: allCampLinks}
    if (item.href === '/safaris/' && cmsSafariLinks.length) return {...item, children: cmsSafariLinks}
    return item
  })

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    const whatsappWidget = document.querySelector<HTMLElement>('.asanja-whatsapp-widget')
    const previousWhatsappVisibility = whatsappWidget?.style.visibility
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        requestAnimationFrame(() => openButtonRef.current?.focus())
      }
    }

    document.body.style.overflow = 'hidden'
    if (whatsappWidget) whatsappWidget.style.visibility = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    requestAnimationFrame(() => closeButtonRef.current?.focus())

    return () => {
      document.body.style.overflow = previousOverflow
      if (whatsappWidget) whatsappWidget.style.visibility = previousWhatsappVisibility ?? ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function toggleSubmenu(href: string) {
    setExpandedMenus((items) => items.includes(href) ? items.filter((item) => item !== href) : [...items, href])
  }

  return <div className="asanja-menu">
    <button
      className="asanja-menu-button"
      ref={openButtonRef}
      type="button"
      aria-label="Open Asanja navigation"
      aria-controls="asanja-menu-panel"
      aria-expanded={isOpen}
      onClick={() => setIsOpen(true)}
    >
      <span className="asanja-menu-icon" aria-hidden="true"><span/><span/><span/></span>
    </button>
    <div className={`asanja-menu-panel${isOpen ? ' is-open' : ''}`} id="asanja-menu-panel" role="dialog" aria-modal="true" aria-label="Asanja navigation" hidden={!isOpen}>
      <div className="asanja-menu-visual" aria-hidden="true">
        {menuLinks.map(({label, image}, index) => <span key={label} className={index === 0 ? 'is-active' : ''} style={{backgroundImage: `url(${image})`}} />)}
      </div>
      <div className="asanja-menu-brand">
        <a href="/" aria-label="Asanja Africa home" onClick={() => setIsOpen(false)}>
          <img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="" width={409} height={314} />
        </a>
        <a className="asanja-menu-booking" href="/plan-my-stay/" onClick={() => setIsOpen(false)}>Make a booking</a>
      </div>
      <div className="asanja-menu-navigation">
        <button
          className="asanja-menu-close"
          ref={closeButtonRef}
          type="button"
          aria-label="Close navigation"
          onClick={() => {
            setIsOpen(false)
            requestAnimationFrame(() => openButtonRef.current?.focus())
          }}
        ><span aria-hidden="true" /></button>
        <nav aria-label="Main navigation">
          <ul className="asanja-menu-list">
            {menuLinks.map((item) => {
              const hasChildren = 'children' in item
              const current = isCurrentPath(pathname, item.href) || (hasChildren && item.children.some(({href}) => isCurrentPath(pathname, href)))
              const submenuOpen = hasChildren && (expandedMenus.includes(item.href) || current)
              return <li key={item.href} className={`${hasChildren ? 'has-children ' : ''}${current ? 'is-current' : ''}`}>
                <div className="asanja-menu-link-row">
                  <a href={item.href} aria-current={current ? 'page' : undefined} onClick={() => setIsOpen(false)}>{item.label}</a>
                  {hasChildren ? <button
                    className={`asanja-submenu-toggle${submenuOpen ? ' is-open' : ''}`}
                    type="button"
                    aria-label={`${submenuOpen ? 'Hide' : 'Show'} ${item.label} links`}
                    aria-expanded={submenuOpen}
                    aria-controls={`asanja-submenu-${item.href.replace(/[^a-z]+/gi, '-')}`}
                    onClick={() => toggleSubmenu(item.href)}
                  ><span className="asanja-submenu-indicator" aria-hidden="true" /></button> : null}
                </div>
                {hasChildren ? <ul className="asanja-submenu" id={`asanja-submenu-${item.href.replace(/[^a-z]+/gi, '-')}`} hidden={!submenuOpen}>
                  {item.children.map((child) => {
                    const childCurrent = isCurrentPath(pathname, child.href)
                    return <li key={child.href} className={childCurrent ? 'is-current' : ''}>
                      <a href={child.href} aria-current={childCurrent ? 'page' : undefined} onClick={() => setIsOpen(false)}>{child.label}</a>
                    </li>
                  })}
                </ul> : null}
              </li>
            })}
          </ul>
        </nav>
      </div>
    </div>
  </div>
}
