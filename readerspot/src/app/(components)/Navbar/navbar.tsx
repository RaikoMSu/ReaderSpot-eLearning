"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux"
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state"
import { Bell, Menu, Moon, Search, Sun, Upload, Cloud, User, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import logo from "@/app/assets/Logo.png"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/(components)/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import { Input } from "@/app/(components)/ui/input"
import { Badge } from "@/app/(components)/ui/badge"
import { useAuth } from "@/app/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/(components)/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const Navbar = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user, userMetadata, logout } = useAuth()
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed)
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSideBarCollapsed))
  }

  const toggleDarkmode = () => {
    dispatch(setIsDarkMode(!isDarkMode))
  }

  const handleViewProfile = () => {
    router.push("/page/profile")
  }

  const handleProfileSettings = () => {
    router.push("/page/profile/settings")
  }

  const handleLogout = async () => {
    await logout()
  }

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Search in books table
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('*')
        .or(`title.ilike.%${query}%, author.ilike.%${query}%, genre.ilike.%${query}%`)
        .limit(5)

      if (!booksError && books) {
        setSearchResults(books)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery) {
      router.push(`/page/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="flex justify-between items-center w-full mb-7">
      {/* Left Side */}
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-yellow-300 dark:hover:bg-yellow-700"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="search"
            placeholder="Search book, series, authors, genres"
            className="pl-10 pr-4 py-2 w-50 md:w-80 border-2 border-gray-300 dark:border-gray-700 bg-transparent rounded-lg focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={handleSearch}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-500 border-t-transparent" />
            ) : (
              <Search className="text-gray-900 dark:text-gray-300" size={18} />
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => router.push(`/page/books/${result.id}`)}
                >
                  <div className="font-medium">{result.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{result.author}</div>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Right Side */}
      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          {/* Import Button and Upload Icon */}
          <div className="relative">
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <button
                  className="bg-yellow-300 dark:bg-yellow-600 text-gray-900 dark:text-gray-100 font-semibold px-4 py-2 md:w-30 rounded-lg flex items-center gap-2 hover:bg-yellow-200 dark:hover:bg-yellow-500 transition-all"
                  onClick={() => setIsImportOpen(true)}
                >
                  <Upload className="text-gray-900 dark:text-gray-100" size={18} />
                  Import
                </button>
              </DialogTrigger>

              {/* Dark Background Overlay */}
              {isImportOpen && <div className="fixed inset-0 bg-slate-900 bg-opacity-10 z-40" />}

              <DialogContent className="sm:max-w-[425px] z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle>Book import</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="add" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="add">Add Books</TabsTrigger>
                    <TabsTrigger value="imports">My Imports</TabsTrigger>
                  </TabsList>
                  <TabsContent value="add">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                      <Cloud className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4">Drag and Drop files here</p>
                      <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                        + Browse Files
                      </button>
                    </div>
                    <ul className="mt-4 text-sm text-gray-500">
                      <li>
                        • Only upload books that you have the legal right to share, whether they are free or paid.
                      </li>
                      <li>• Avoid sharing bad scans, incomplete e-books, or draft materials.</li>
                      <li>
                        • Share books in authorized formats: PDF, FB2, EPUB, LIT, LRF, MOBI, ODT, RTF, SNB, DJVU, AZW2,
                        and AZW.
                      </li>
                      <li>
                        • Do not upload magazines, articles, lectures, school or student materials, or any content that
                        you don't have the rights to share.
                      </li>
                      <li>• If you come across any copyrighted content or violations, please report them.</li>
                    </ul>
                  </TabsContent>
                  <TabsContent value="imports">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                      <Input placeholder="Search books, series, authors, genres" className="pl-8" />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">All</Badge>
                      <Badge variant="outline" className="bg-green-500 text-white">
                        Free
                      </Badge>
                      <Badge variant="outline" className="bg-red-500 text-white">
                        Paid
                      </Badge>
                      <Badge variant="outline" className="bg-yellow-500 text-white">
                        Pending
                      </Badge>
                    </div>
                    <ul className="mt-4 space-y-4">{/* Add your imported books list here */}</ul>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>

          {/* Bell Icon with Notification */}
          <div className="relative">
            <Bell className="cursor-pointer text-gray-500 dark:text-gray-400" size={24} />
            <span className="absolute -top-1 -right-2 flex items-center justify-center px-1 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
              3
            </span>
          </div>

          {/* Vertical Line */}
          <hr className="w-0 h-7 border-solid border-l border-gray-300 dark:border-gray-700 mx-3" />

          {/* Profile Section with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Image
                    src={user?.user_metadata?.avatar_url || logo || "/placeholder.svg"}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full h-full object-cover"
                  />
                </div>
                <span className="font-semibold">{userMetadata?.username || "User"}</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-gray-50 border-gray-200 text-black" align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer hover:bg-gray-100">
                  <User className="mr-2 h-4 w-4" />
                  <span>View Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleProfileSettings} className="cursor-pointer hover:bg-gray-100">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-900" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-gray-100">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dark Mode Toggle */}
        <button onClick={toggleDarkmode}>
          {isDarkMode ? (
            <Sun className="text-gray-900 dark:text-gray-100" size={24} />
          ) : (
            <Moon className="text-gray-900 dark:text-gray-100" size={24} />
          )}
        </button>
      </div>
    </div>
  )
}

export default Navbar

