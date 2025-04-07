"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"
import Navbar from "@/app/(components)/Navbar/navbar"
import Sidebar from "@/app/(components)/Sidebar/sidebar"
import { useAppSelector } from "@/redux"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed)
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

  // Redirect unauthenticated users to login, but not during logout
  useEffect(() => {
    // Skip this redirect if:
    // 1. Auth is still loading
    // 2. We're already on a login/register page
    // 3. URL has logout=true parameter (handled by AuthContext)
    if (isLoading || 
        pathname.includes("/page/login") || 
        pathname.includes("/page/register") ||
        window.location.search.includes("logout=true")) {
      return;
    }
    
    // Only redirect if user is definitely not authenticated
    if (!isAuthenticated) {
      router.push("/page/login");
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  // For login, register, and edit profile pages, don't show layout
  const noLayoutPages = [
    "/page/login",
    "/page/register",
    "/page/profile/edit",
  ];

  if (!isAuthenticated || noLayoutPages.some(page => pathname.includes(page))) {
    return <>{children}</>;
  }

  // For authenticated users on other pages, show the full layout
  return (
    <div
      className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white w-full min-h-screen`}
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full py-7 px-9 bg-gray-50 dark:bg-gray-900 ${isSideBarCollapsed ? "md:pl-16" : "md:pl-64"}`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  )
}

