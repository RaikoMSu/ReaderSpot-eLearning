import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./contexts/AuthContext"
import StoreProvider from "@/redux"
import { Toaster } from "@/app/(components)/ui/toaster"

// Import Poppins from Google Fonts
const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ReaderSpot - Your Reading Companion",
  description: "A comprehensive eLearning platform for readers to discover new books, track reading progress, and learn new languages through literature.",
  keywords: ["reading", "eLearning", "books", "language learning", "literature", "education"],
  authors: [{ name: "ReaderSpot Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" }
  ],
  openGraph: {
    title: "ReaderSpot - Your Reading Companion",
    description: "A comprehensive eLearning platform for readers",
    url: "https://readerspot.com",
    siteName: "ReaderSpot",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReaderSpot - Your Reading Companion",
    description: "A comprehensive eLearning platform for readers",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="ReaderSpot" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ReaderSpot" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${poppins.variable} font-poppins antialiased`}>
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  )
}

