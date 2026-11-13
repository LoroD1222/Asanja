import 'server-only'
import {readFile} from 'node:fs/promises'
import {resolve, sep} from 'node:path'
import sharp from 'sharp'
import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage} from 'pdf-lib'
import type {PageText, SafariTrip} from './page-types'
import type {SanityImage} from './types'
import {tripRouteStops} from './trip-route'

function plain(value?: PageText) {
  return (value || []).map((block) => block.children?.map((child) => child.text || '').join('') || '').filter(Boolean).join('\n')
}

function pdfSafe(value: string) {
  return value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/[\u2022]/g, '-').replace(/[^\x20-\x7e\xa0-\xff\n]/g, '?')
}

async function imageBytes(image?: SanityImage) {
  const source = image?.asset?.url
  if (!source) return null
  if (source.startsWith('/')) {
    const publicRoot = resolve(process.cwd(), 'public')
    const file = resolve(publicRoot, `.${source}`)
    if (!file.startsWith(`${publicRoot}${sep}`)) return null
    return readFile(file)
  }
  const url = new URL(source)
  if (url.protocol !== 'https:' || url.hostname !== 'cdn.sanity.io' || !url.pathname.startsWith('/images/')) return null
  url.searchParams.set('w', '1600')
  url.searchParams.set('fit', 'max')
  url.searchParams.set('fm', 'jpg')
  const response = await fetch(url, {signal: AbortSignal.timeout(8000)})
  if (!response.ok || Number(response.headers.get('content-length') || 0) > 15_000_000) return null
  const bytes = Buffer.from(await response.arrayBuffer())
  return bytes.length <= 15_000_000 ? bytes : null
}

async function embedPhoto(document: PDFDocument, image?: SanityImage, crop?: {width: number; height: number}): Promise<PDFImage | null> {
  try {
    const bytes = await imageBytes(image)
    if (!bytes) return null
    const jpeg = await sharp(bytes).rotate()
      .resize(crop ? {width: crop.width, height: crop.height, fit: 'cover', position: 'attention'} : {width: 1400, withoutEnlargement: true})
      .jpeg({quality: 80}).toBuffer()
    return document.embedJpg(jpeg)
  } catch {return null}
}

export async function buildTripPdf(trip: SafariTrip, contact?: {contactEmail?: string; whatsappNumber?: string; pageUrl?: string; isPreview?: boolean}) {
  const document = await PDFDocument.create()
  document.setTitle(`${trip.title} | Asanja Africa itinerary`)
  document.setAuthor('Asanja Africa')
  document.setSubject(contact?.isPreview ? 'Safari itinerary template preview' : 'Published safari itinerary')
  const bodyFont = await document.embedFont(StandardFonts.Helvetica)
  const headingFont = await document.embedFont(StandardFonts.TimesRoman)
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold)
  const width = 595, height = 842, margin = 54, contentWidth = width - margin * 2
  const deep = rgb(.18, .24, .18), moss = rgb(.34, .43, .32), gold = rgb(.70, .49, .29), muted = rgb(.41, .45, .40)
  let page!: PDFPage
  let y = 0

  function newPage() {
    page = document.addPage([width, height]); y = height - 56
    page.drawText('ASANJA AFRICA', {x: margin, y, size: 11, font: boldFont, color: deep})
    page.drawLine({start: {x: margin, y: y - 14}, end: {x: width - margin, y: y - 14}, thickness: 1, color: gold})
    y -= 45
  }
  function ensure(space: number) {if (y - space < 64) newPage()}
  function wrapped(text: string, font: PDFFont, size: number, maxWidth: number) {
    const lines: string[] = []
    for (const paragraph of pdfSafe(text).split('\n')) {
      let line = ''
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (font.widthOfTextAtSize(word, size) > maxWidth) {
          if (line) {lines.push(line); line = ''}
          let fragment = ''
          for (const character of word) {
            if (font.widthOfTextAtSize(fragment + character, size) > maxWidth && fragment) {
              lines.push(fragment)
              fragment = character
            } else fragment += character
          }
          line = fragment
          continue
        }
        const candidate = line ? `${line} ${word}` : word
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) line = candidate
        else {if (line) lines.push(line); line = word}
      }
      lines.push(line)
    }
    return lines
  }
  function draw(text: string, {size = 10, font = bodyFont, lineHeight = 16, color = muted, indent = 0, gap = 9}: {size?: number; font?: PDFFont; lineHeight?: number; color?: ReturnType<typeof rgb>; indent?: number; gap?: number} = {}) {
    const lines = wrapped(text, font, size, contentWidth - indent)
    for (const line of lines) {
      ensure(lineHeight + gap)
      if (line) page.drawText(line, {x: margin + indent, y, size, font, color})
      y -= lineHeight
    }
    y -= gap
  }
  function heading(title: string) {ensure(56); y -= 8; draw(title, {size: 20, font: headingFont, lineHeight: 24, color: deep, gap: 12})}
  function list(items?: string[]) {for (const item of items || []) draw(`- ${item}`, {size: 9.5, lineHeight: 15, gap: 2})}
  function imageInBox(image: PDFImage, x: number, bottom: number, boxWidth: number, boxHeight: number) {
    page.drawRectangle({x, y: bottom, width: boxWidth, height: boxHeight, color: rgb(.96, .95, .92)})
    const scale = Math.min(boxWidth / image.width, boxHeight / image.height)
    const imageWidth = image.width * scale, imageHeight = image.height * scale
    page.drawImage(image, {x: x + (boxWidth - imageWidth) / 2, y: bottom + (boxHeight - imageHeight) / 2, width: imageWidth, height: imageHeight})
  }

  newPage()
  if (contact?.isPreview) draw('TEMPLATE PREVIEW - DATES, DAILY ACTIVITIES AND ACCOMMODATION REQUIRE CONFIRMATION', {size: 9, font: boldFont, color: gold, gap: 12})
  const cover = await embedPhoto(document, trip.heroImage, {width: 1400, height: 590})
  if (cover) {imageInBox(cover, margin, y - 205, contentWidth, 205); y -= 245}
  draw(trip.title, {size: 30, font: headingFont, lineHeight: 34, color: deep, gap: 16})
  draw(`${trip.durationDays} days${trip.durationNights !== undefined ? ` / ${trip.durationNights} nights` : ''}${trip.travelStyle ? `  |  ${trip.travelStyle}` : ''}`, {size: 11, font: boldFont, color: gold, gap: 18})
  if (trip.summary) draw(trip.summary, {size: 12, lineHeight: 19, color: deep, gap: 18})
  if (trip.introduction?.length) {heading('Journey overview'); draw(plain(trip.introduction))}
  if (trip.relatedDestinations?.length) {heading('Destinations'); draw(trip.relatedDestinations.filter(Boolean).map((item) => item.title).join('  -  '))}
  const route = tripRouteStops(trip)
  if (route.length) {
    newPage()
    heading('Your route through Tanzania')
    draw('Follow the journey from the first stop to the final safari destination. Markers are approximate reference points, not a navigation plan.', {size: 10, color: muted, gap: 12})
    const mapSize = 390, mapX = (width - mapSize) / 2, mapY = y - mapSize
    try {
      const mapBytes = await readFile(resolve(process.cwd(), 'public/legacy/wp-content/uploads/2024/08/Map_of_tanzania-02.png'))
      const map = await document.embedPng(mapBytes)
      imageInBox(map, mapX, mapY, mapSize, mapSize)
    } catch {page.drawRectangle({x: mapX, y: mapY, width: mapSize, height: mapSize, color: rgb(.96, .95, .92)})}
    const west = 29.3, east = 40.45, south = -11.75, north = -0.98
    const points = route.map((stop) => ({
      x: mapX + 20 + ((stop.coordinates!.lng - west) / (east - west)) * (mapSize - 40),
      y: mapY + 20 + ((stop.coordinates!.lat - south) / (north - south)) * (mapSize - 40),
    }))
    for (let index = 1; index < points.length; index++) page.drawLine({start: points[index - 1], end: points[index], thickness: 3, color: gold, opacity: .9})
    points.forEach((point, index) => {
      page.drawCircle({x: point.x, y: point.y, size: 12, color: moss, borderColor: rgb(1, 1, 1), borderWidth: 2})
      const number = String(index + 1)
      page.drawText(number, {x: point.x - boldFont.widthOfTextAtSize(number, 9) / 2, y: point.y - 3.3, size: 9, font: boldFont, color: rgb(1, 1, 1)})
    })
    y = mapY - 20
    route.forEach((stop, index) => draw(`${index + 1}. ${stop.name}${stop.dayLabel ? `  |  ${stop.dayLabel}` : ''}`, {size: 9, font: index === 0 ? boldFont : bodyFont, color: deep, lineHeight: 14, gap: 1}))
  }
  if (trip.itinerary?.length) {
    ensure(150)
    heading('Day-by-day itinerary')
    for (const day of trip.itinerary) {
      ensure(82)
      draw(`DAY ${day.dayNumber}  ${day.title}`, {size: 12, font: boldFont, color: moss, gap: 5})
      if (day.description?.length) draw(plain(day.description), {size: 9.5, lineHeight: 15, indent: 12, gap: 6})
      if (day.activities?.length) draw(`Activities: ${day.activities.join(', ')}`, {size: 9, indent: 12, gap: 3})
      if (day.meals?.length) draw(`Meals: ${day.meals.join(', ')}`, {size: 9, indent: 12, gap: 3})
      if (day.accommodation?.title) draw(`Overnight: ${day.accommodation.title}`, {size: 9, indent: 12, gap: 3})
      if (day.notes) draw(day.notes, {size: 9, indent: 12, gap: 4})
    }
  }
  const photoSources: Array<{image: SanityImage; caption: string}> = []
  const seenPhotos = new Set<string>()
  for (const media of trip.gallery || []) {
    const source = media.image?.asset?.url
    if (media.kind !== 'photo' || !media.image || !source || seenPhotos.has(source)) continue
    seenPhotos.add(source)
    photoSources.push({image: media.image, caption: media.caption || media.image.alt || 'Safari moment'})
  }
  for (const day of trip.itinerary || []) {
    const source = day.image?.asset?.url
    if (!day.image || !source || seenPhotos.has(source)) continue
    seenPhotos.add(source)
    photoSources.push({image: day.image, caption: day.title})
  }
  if (photoSources.length) {
    const photos = (await Promise.all(photoSources.slice(0, 4).map(async (item) => ({...item, embedded: await embedPhoto(document, item.image, {width: 1000, height: 866})})))).filter((item) => item.embedded)
    if (photos.length) {
      newPage()
      heading('Scenes from the journey')
      draw('A glimpse of the landscapes and stays that inspire this safari.', {size: 10, gap: 15})
      const gap = 13, boxWidth = (contentWidth - gap) / 2, boxHeight = 205, rowHeight = 238
      photos.forEach((item, index) => {
        const column = index % 2, row = Math.floor(index / 2)
        const x = margin + column * (boxWidth + gap)
        const bottom = y - boxHeight - row * rowHeight
        imageInBox(item.embedded!, x, bottom, boxWidth, boxHeight)
        const caption = wrapped(item.caption, boldFont, 9, boxWidth)[0] || 'Safari moment'
        page.drawText(caption, {x, y: bottom - 16, size: 9, font: boldFont, color: deep})
      })
      y -= Math.ceil(photos.length / 2) * rowHeight + 6
    }
  }
  if (trip.relatedCamps?.length) {newPage(); heading('Accommodation'); for (const camp of trip.relatedCamps.filter(Boolean)) draw(`${camp.title}${camp.location ? ` - ${camp.location}` : ''}${camp.summary ? `\n${camp.summary}` : ''}`, {gap: 8})}
  if (trip.included?.length) {heading('Included'); list(trip.included)}
  if (trip.excluded?.length) {heading('Not included'); list(trip.excluded)}
  if (trip.travelInformation?.length) {heading('Before you travel'); draw(plain(trip.travelInformation))}
  if (trip.travelNotes?.length) {heading('Important notes'); list(trip.travelNotes)}
  heading('Plan this journey')
  draw('Your itinerary can be tailored to your dates, interests and preferred pace. Contact Asanja Africa for a confirmed quotation.', {gap: 7})
  if (contact?.contactEmail) draw(`Email: ${contact.contactEmail}`, {size: 9, gap: 3})
  if (contact?.whatsappNumber) draw(`WhatsApp: +${contact.whatsappNumber}`, {size: 9, gap: 3})
  draw(`Safari page: ${contact?.pageUrl || `https://asanjaafrica.com/safaris/${trip.slug}/`}`, {size: 9, gap: 3})

  document.getPages().forEach((item, index) => {item.drawLine({start: {x: margin, y: 47}, end: {x: width - margin, y: 47}, thickness: .5, color: gold}); item.drawText(`ASANJA AFRICA  |  ${index + 1} / ${document.getPageCount()}`, {x: margin, y: 30, size: 8, font: bodyFont, color: muted})})
  return document.save()
}
