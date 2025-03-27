import type React from "react"
import AppLayout from "@/app/layouts/AppLayout"

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>
}

