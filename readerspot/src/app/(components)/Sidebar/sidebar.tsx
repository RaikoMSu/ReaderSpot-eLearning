"use client"

import Image from "next/image"
import { useAppDispatch, useAppSelector } from "@/redux"
import { setIsSidebarCollapsed } from "@/state"
import {
  Book,
  BarChartIcon as ChartNoAxesColumn,
  Library,
  LogOut,
  Mails,
  Menu,
  MessageCircleQuestion,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"
import logo from "@/app/assets/Logo.png"
import { useAuth } from "@/app/contexts/AuthContext"

interface SidebarLinkProps {
  href: string
  icon: React.ElementType
  label: string
  isCollapsed: boolean
  isLogout?: boolean
  onClick?: () => void
}

const SidebarLink = ({ href, icon: Icon, label, isCollapsed, isLogout, onClick }: SidebarLinkProps) => {
  const pathname = usePathname()
  // Check if the current path matches the link
  const isActive = pathname === href || pathname.startsWith(href + "/")

  if (isLogout) {
    return (
      <button
        onClick={onClick}
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        } gap-3 transition-colors w-full`}
      >
        <Icon className={`w-6 h-6 transition-colors text-gray-700 dark:text-gray-300 hover:text-red-500`} />
        <span
          className={`${isCollapsed ? "hidden" : "block"} font-medium text-gray-700 dark:text-gray-300 hover:text-red-500`}
        >
          {label}
        </span>
      </button>
    )
  }

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        } gap-3 transition-colors ${isActive ? "bg-white-300 text-yellow-500" : ""}`}
      >
        <Icon
          className={`w-6 h-6 transition-colors ${
            isActive ? "text-yellow-500" : "text-gray-700 dark:text-gray-300 hover:text-yellow-500"
          }`}
        />
        <span
          className={`${isCollapsed ? "hidden" : "block"} font-medium ${
            isActive ? "text-yellow-500" : "text-gray-700 dark:text-gray-300"
          } hover:text-yellow-500`}
        >
          {label}
        </span>
      </div>
    </Link>
  )
}

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const { logout } = useAuth()
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed)

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSideBarCollapsed))
  }

  const handleLogout = async () => {
    await logout()
  }

  const sidebarClassNames = `fixed flex flex-col ${
    isSideBarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white dark:bg-gray-800 transition-all duration-300 overflow-hidden h-full shadow-md z-40`

  return (
    <div className={sidebarClassNames}>
      {/* LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSideBarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <Image
          src={logo || "/placeholder.svg"}
          alt="readerspot-logo"
          width={100}
          height={100}
          className="rounded w-8"
        />
        <h1 className={`${isSideBarCollapsed ? "hidden" : "block"} font-extrabold text-2xl`}>ReaderSpot</h1>
        <button
          className="md:hidden px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-gray-600"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Links */}
      <div className="flex-grow mt-8">
        {/* Responsive hr */}
        <hr className="border-t border-gray-300 dark:border-gray-700 mx-3 my-4" />
        <span className="flex flex-col justify-between items-center py-4 text-gray-700 dark:text-gray-300">Main</span>
        {/* Library link now points to /page/library */}
        <SidebarLink href="/page/library" icon={Library} label="Library" isCollapsed={isSideBarCollapsed} />
        {/* Book link now points to /page/books */}
        <SidebarLink href="/page/books" icon={Book} label="Book" isCollapsed={isSideBarCollapsed} />
        <SidebarLink
          href="/page/leaderboards"
          icon={ChartNoAxesColumn}
          label="Leaderboards"
          isCollapsed={isSideBarCollapsed}
        />

        {/* Responsive hr */}
        <hr className="border-t border-gray-300 dark:border-gray-700 mx-3 my-4" />
        <span className="flex flex-col justify-between items-center py-4 text-gray-700 dark:text-gray-300">
          Support
        </span>
        <SidebarLink
          href="/page/questions"
          icon={MessageCircleQuestion}
          label="Question and Answer"
          isCollapsed={isSideBarCollapsed}
        />
        <SidebarLink href="/page/mails" icon={Mails} label="Mails" isCollapsed={isSideBarCollapsed} />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <SidebarLink href="/page/profile/settings" icon={Settings} label="Settings" isCollapsed={isSideBarCollapsed} />
        {/* Logout link now has onClick handler */}
        <SidebarLink
          href="/page/login"
          icon={LogOut}
          label="Log out"
          isCollapsed={isSideBarCollapsed}
          isLogout={true}
          onClick={handleLogout}
        />
      </div>
    </div>
  )
}

export default Sidebar

