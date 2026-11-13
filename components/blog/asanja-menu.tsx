'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {campLinks, siteMenuLinks} from './asanja-site-data'

function isCurrentPath(pathname: string, href: string) {
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`
  return normalized === href || (href === '/blogs/' && normalized.startsWith('/blogs/'))
}

type CmsCampLink = {label: string; href: string}

export function AsanjaMenu({cmsCampLinks = []}: {cmsCampLinks?: CmsCampLink[]}) {
  const pathname = usePathname()
  const allCampLinks = [...campLinks, ...cmsCampLinks].filter((item, index, items) => items.findIndex(({href}) => href === item.href) === index)
  const menuLinks = siteMenuLinks.map((item) => item.href === '/camps-and-lodges/' ? {...item, children: allCampLinks} : item)
  const campsCurrent = allCampLinks.some(({href}) => isCurrentPath(pathname, href)) || isCurrentPath(pathname, '/camps-and-lodges/')

  return <div className="asanja-menu">
    <a className="asanja-menu-button" href="#asanja-menu-panel" aria-label="Open Asanja navigation" aria-controls="asanja-menu-panel">
      <span className="asanja-menu-icon" aria-hidden="true"><span/><span/><span/></span>
    </a>
    <div className="asanja-menu-panel" id="asanja-menu-panel" role="dialog" aria-modal="true" aria-label="Asanja navigation">
      <div className="asanja-menu-visual" aria-hidden="true">
        {menuLinks.map(({label, image}, index) => <span key={label} className={index === 0 ? 'is-active' : ''} style={{backgroundImage: `url(${image})`}} />)}
      </div>
      <div className="asanja-menu-brand">
        <Link href="/" aria-label="Asanja Africa home">
          <img src="/legacy/wp-content/uploads/2020/08/Asanja-web-badge-04.svg" alt="" width={409} height={314} />
        </Link>
        <Link className="asanja-menu-booking" href="/plan-my-stay/">Make a booking</Link>
      </div>
      <div className="asanja-menu-navigation">
        <a className="asanja-menu-close" href="#" aria-label="Close navigation"><span aria-hidden="true" /></a>
        <nav aria-label="Main navigation">
          <ul className="asanja-menu-list">
            {menuLinks.map((item) => {
              const hasChildren = 'children' in item
              const current = hasChildren ? campsCurrent : isCurrentPath(pathname, item.href)
              return <li key={item.href} className={`${hasChildren ? 'has-children ' : ''}${current ? 'is-current' : ''}`}>
                <div className="asanja-menu-link-row">
                  <Link href={item.href} aria-current={current ? 'page' : undefined}>{item.label}</Link>
                  {hasChildren ? <span className="asanja-submenu-indicator" aria-hidden="true" /> : null}
                </div>
                {hasChildren ? <ul className="asanja-submenu">
                  {item.children.map((child) => {
                    const childCurrent = isCurrentPath(pathname, child.href)
                    return <li key={child.href} className={childCurrent ? 'is-current' : ''}>
                      <Link href={child.href} aria-current={childCurrent ? 'page' : undefined}>{child.label}</Link>
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
