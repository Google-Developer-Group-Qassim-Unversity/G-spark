import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'G-Spark Conference | حفل ختام انشطة مجموعة قوقل للطلبة المطورين',
  description: 'Join us for the G-Spark Conference - Google Developer Student Club closing ceremony',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-gspark.png',
    apple: '/logo-gspark.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4285F4',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
