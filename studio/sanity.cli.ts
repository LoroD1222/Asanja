import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './env'

export default defineCliConfig({
  api: {projectId, dataset},
  deployment: {
    appId: 'j9aw6a2jgxaonx2s4tcyo728',
  },
  typegen: {
    enabled: true,
    path: '../{app,components,sanity}/**/*.{ts,tsx}',
    schema: './schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})
