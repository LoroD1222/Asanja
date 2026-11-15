import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'
import localFont from 'next/font/local'
import './safari-pages.css'

const asanjaBodyFont = localFont({src: '../public/fonts/raleway-latin.woff2', weight: '400 700', display: 'swap', variable: '--asanja-body-font'})
const asanjaUiFont = localFont({src: '../public/fonts/commissioner-latin.woff2', weight: '400 700', display: 'swap', variable: '--asanja-ui-font'})

export const metadata: Metadata = {
  metadataBase: new URL('https://asanjaafrica.com'),
  title: {default: 'Asanja Africa', template: '%s | Asanja Africa'},
  description: 'Open hearts and wild spirits. Discover authentic safari experiences with Asanja Africa.',
}

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const preview = (await draftMode()).isEnabled

  return (
    <html lang="en" className={`${asanjaBodyFont.variable} ${asanjaUiFont.variable}`}>
      <body style={{margin: 0}}>
        {children}
        {preview ? <VisualEditing /> : null}
      </body>
    </html>
  )
}
