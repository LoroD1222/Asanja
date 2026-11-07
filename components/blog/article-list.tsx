import {ArticleCard} from './article-card'
import type {ArticleCardData} from '../../sanity/types'

export function ArticleList({articles}: {articles: ArticleCardData[]}) {
  if (!articles.length) {
    return (
      <div className="empty-state">
        <h2>Stories are coming soon</h2>
        <p>Our safari journal is being prepared. Please check back shortly.</p>
      </div>
    )
  }

  return <div className="article-grid">{articles.map((article) => <ArticleCard key={article._id} article={article} />)}</div>
}
