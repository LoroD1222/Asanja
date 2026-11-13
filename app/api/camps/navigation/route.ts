import {NextResponse} from 'next/server'
import {getPublishedCampMenuItems} from '../../../../sanity/camp-data'

export async function GET() {
  const camps = await getPublishedCampMenuItems().catch(() => [])
  return NextResponse.json({camps}, {
    headers: {'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'},
  })
}
