import type {ReactNode} from 'react'
import {AsanjaFooter} from './asanja-footer'
import {AsanjaHeader} from './asanja-header'
import {getCampMenuItems} from '../../sanity/camp-data'
import '../../app/sanity-blog.css'

export async function BlogShell({children, className = '', currentPath = ''}: {children: ReactNode; className?: string; currentPath?: string}) {
  const cmsCampLinks = await getCampMenuItems().catch(() => [])

  return (
    <div className={`sanity-blog asanja-shared-shell ${className}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <AsanjaHeader cmsCampLinks={cmsCampLinks} currentPath={currentPath} />
      <main id="main-content">{children}</main>
      <AsanjaFooter />
    </div>
  )
}
