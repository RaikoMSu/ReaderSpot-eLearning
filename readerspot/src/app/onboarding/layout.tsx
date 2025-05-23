import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ReaderSpot - Onboarding',
  description: 'Set up your reading preferences',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dark">
      <div className={`${inter.className} bg-background text-foreground`}>
        {children}
      </div>
    </div>
  )
} 