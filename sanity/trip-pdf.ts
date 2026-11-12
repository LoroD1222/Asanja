import 'server-only'
import {PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage} from 'pdf-lib'
import type {PageText, SafariTrip} from './page-types'

function plain(value?: PageText) {
  return (value || []).map((block) => block.children?.map((child) => child.text || '').join('') || '').filter(Boolean).join('\n')
}

function pdfSafe(value: string) {
  return value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-').replace(/[\u2022]/g, '-').replace(/[^\x20-\x7e\xa0-\xff\n]/g, '?')
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
  let page: PDFPage
  let y: number

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

  newPage()
  if (contact?.isPreview) draw('TEMPLATE PREVIEW - DATES, DAILY ACTIVITIES AND ACCOMMODATION REQUIRE CONFIRMATION', {size: 9, font: boldFont, color: gold, gap: 12})
  draw(trip.title, {size: 30, font: headingFont, lineHeight: 34, color: deep, gap: 16})
  draw(`${trip.durationDays} days${trip.durationNights !== undefined ? ` / ${trip.durationNights} nights` : ''}${trip.travelStyle ? `  |  ${trip.travelStyle}` : ''}`, {size: 11, font: boldFont, color: gold, gap: 18})
  if (trip.summary) draw(trip.summary, {size: 12, lineHeight: 19, color: deep, gap: 18})
  if (trip.introduction?.length) {heading('Journey overview'); draw(plain(trip.introduction))}
  if (trip.relatedDestinations?.length) {heading('Destinations'); draw(trip.relatedDestinations.filter(Boolean).map((item) => item.title).join('  -  '))}
  if (trip.itinerary?.length) {
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
  if (trip.relatedCamps?.length) {heading('Accommodation'); for (const camp of trip.relatedCamps.filter(Boolean)) draw(`${camp.title}${camp.location ? ` - ${camp.location}` : ''}${camp.summary ? `\n${camp.summary}` : ''}`, {gap: 8})}
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
