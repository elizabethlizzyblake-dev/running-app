import type { Metadata, Viewport } from 'next'
import { Fraunces, Mulish } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { NotificationBell } from '@/components/notification-bell'
import './globals.css'

// Runika's display voice — a handcrafted, optical editorial serif.
// The SOFT + WONK axes give it that storybook warmth and quirk that makes
// every title feel hand-lettered and iconic rather than templated.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
})

// Runika's reading voice — a warm, rounded humanist sans that stays
// effortlessly legible at small sizes while feeling friendly, not corporate.
const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-body",
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Runika — A Cosy Running Adventure',
  description: 'Lace up with Runi, your glowing companion. Unlock memories, wander new adventures, and watch your running journey unfold.',
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
  themeColor: "#F3E9DC",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#F3E9DC]">
      <body className={`${fraunces.variable} ${mulish.variable} font-sans antialiased`}>
        {children}
        <NotificationBell />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
