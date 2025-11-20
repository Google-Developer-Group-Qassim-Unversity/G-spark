import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { OneSignalProvider } from '@/components/onesignal-provider'
import { Tajawal } from 'next/font/google'
import './globals.css'
import '@/styles/onesignal-custom-prompt.css'

const tajawal = Tajawal({ 
  weight: ['400', '500', '700', '800'],
  subsets: ['arabic'],
  display: 'swap',
})

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
    <ClerkProvider>
      <html lang="ar" dir="rtl">
        <body className={`${tajawal.className} antialiased`}>
          <OneSignalProvider>
            {children}
          </OneSignalProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
