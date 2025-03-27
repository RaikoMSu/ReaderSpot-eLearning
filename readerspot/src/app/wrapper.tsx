"use client"

import type React from "react"
import { useEffect } from "react"
import Navbar from "@/app/(components)/Navbar/navbar"
import Sidebar from "@/app/(components)/Sidebar/sidebar"
import StoreProvider, { useAppSelector } from "@/redux"

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed)
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)

  useEffect(() => {
    // Update the document class based on dark mode state
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
      document.documentElement.classList.remove("light")
    } else {
      document.documentElement.classList.add("light")
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode]) // Add isDarkMode as a dependency

  return (
    <div
      className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white w-full min-h-screen`}
    >
      <Sidebar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 dark:bg-gray-900 ${isSideBarCollapsed ? "md:pl-24" : "md:pl-72"}`}
      >
        <Navbar />
        {children}
      </main>
    </div>
  )
}

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <Layout>{children}</Layout>
    </StoreProvider>
  )
}

export default Wrapper

