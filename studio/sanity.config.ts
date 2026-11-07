import {defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {dataset, previewOrigin, projectId} from './env'
import {resolve} from './src/presentation/resolve'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'

export default defineConfig({
  name: 'asanjaAfrica',
  title: 'Asanja Africa CMS',
  projectId,
  dataset,
  plugins: [
    structureTool({structure}),
    presentationTool({
      resolve,
      previewUrl: {
        origin: previewOrigin,
        previewMode: {enable: '/api/draft-mode/enable'},
      },
    }),
    visionTool(),
  ],
  schema: {types: schemaTypes},
})
