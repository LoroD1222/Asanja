import {AsanjaMenu, type CmsMenuLink} from './asanja-menu'

export function AsanjaHeader({
  cmsCampLinks = [],
  currentPath = '',
}: {
  cmsCampLinks?: CmsMenuLink[]
  currentPath?: string
}) {
  return (
    <header className="asanja-site-header" data-asanja-original-header="true">
      <div className="asanja-header-inner">
        <a className="asanja-header-logo" href="/" aria-label="Asanja Africa home">
          <img src="/legacy/wp-content/uploads/2020/08/Asanja_Logo_clean.svg" alt="Asanja Africa" width={281} height={52} />
        </a>
        <div className="asanja-header-actions">
          <a className="asanja-quote-link" href="/plan-my-stay/">Request a quote</a>
          <AsanjaMenu cmsCampLinks={cmsCampLinks} currentPath={currentPath} />
        </div>
      </div>
    </header>
  )
}
