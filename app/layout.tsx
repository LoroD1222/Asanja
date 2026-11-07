import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import {VisualEditing} from 'next-sanity/visual-editing'

export const metadata: Metadata = {
  metadataBase: new URL('https://asanjaafrica.com'),
  title: {default: 'Asanja Africa', template: '%s | Asanja Africa'},
  description: 'Open hearts and wild spirits. Discover authentic safari experiences with Asanja Africa.',
}

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const preview = (await draftMode()).isEnabled

  return (
    <html lang="en">
      <body style={{margin: 0}}>
        {children}
        {preview ? <VisualEditing /> : null}
      </body>
    </html>
  )
}
