import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./contexts/AuthContext"
import StoreProvider from "@/redux"

// Import Poppins from Google Fonts
const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ReaderSpot - Your Reading Companion",
  description: "A comprehensive eLearning platform for readers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <StoreProvider>
          <AuthProvider>{children}</AuthProvider>
        </StoreProvider>
      </body>
    </html>
  )
}

