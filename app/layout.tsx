import type { Metadata, Viewport } from 'next'
import { Archivo, Spline_Sans_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NotificationBell } from '@/components/notification-bell'
import './globals.css'

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: 'swap'
})

const splineSansMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Paceline Run Club',
  description: 'Run together. Rise together. Track your runs, earn patches, and conquer quests with your run club.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E3A30",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#F3EEE3]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800&family=Spline+Sans+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${archivo.variable} ${splineSansMono.variable} font-sans antialiased`}>
        {children}
        <NotificationBell />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
