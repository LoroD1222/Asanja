import {article} from './documents/article'
import {author} from './documents/author'
import {category} from './documents/category'
import {tag} from './documents/tag'
import {articleImage} from './objects/articleImage'
import {articleTable} from './objects/articleTable'
import {blockContent} from './objects/blockContent'
import {legacyShortcode} from './objects/legacyShortcode'
import {migrationMetadata} from './objects/migrationMetadata'
import {migrationNote} from './objects/migrationNote'
import {seo} from './objects/seo'
import {tableRow} from './objects/tableRow'

export const schemaTypes = [
  article,
  author,
  category,
  tag,
  seo,
  migrationMetadata,
  blockContent,
  articleImage,
  articleTable,
  tableRow,
  legacyShortcode,
  migrationNote,
]
