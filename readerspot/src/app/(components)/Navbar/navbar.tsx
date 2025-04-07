"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux"
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state"
import { Bell, Menu, Moon, Search, Sun, Upload, User, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogTrigger } from "@/app/(components)/ui/dialog"
import { Input } from "@/app/(components)/ui/input"
import { useAuth } from "@/app/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/(components)/ui/dropdown-menu"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/app/(components)/ui/use-toast"
import { Alert, AlertTitle, AlertDescription } from "@/app/(components)/ui/alert"
import { Button } from "@/app/(components)/ui/button"
import ImportBookModal from "@/app/(components)/import-book-modal"

// Add this type definition for the upload progress
interface ProgressEvent {
  loaded: number;
  total: number;
}

const Navbar = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { user, userMetadata, logout } = useAuth()
  const isSideBarCollapsed = useAppSelector((state) => state.global.isSideBarCollapsed)
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()
  const [myBooks, setMyBooks] = useState<any[]>([])

  // Determine if import should be hidden (Search is always visible now)
  const hideImport = pathname === '/page/profile' || pathname.startsWith('/page/') && !pathname.startsWith('/page/library') && !pathname.startsWith('/page/books')

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
  
  const fetchMyBooks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setMyBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };
  
  useEffect(() => {
    if (isImportOpen) {
      fetchMyBooks();
    }
  }, [isImportOpen, user]);

  return (
    <div className="flex justify-between items-center w-full">
      {/* Left Side: Toggle Button + Search Bar */}
      <div className="flex gap-3 items-center">
        {/* Sidebar Toggle (Desktop + Mobile) */}
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" // Simple styling for both
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative">
          <form onSubmit={handleSearchSubmit}>
            <Input
              type="text"
              placeholder="Search books, authors..."
              className="w-64 pl-10 pr-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 border-transparent focus:border-yellow-400 focus:ring focus:ring-yellow-200 focus:ring-opacity-50 text-sm"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </form>
          {/* Search results dropdown can be added here if needed */}
        </div>
      </div>

      {/* Right Side: Import, Notifications, Profile, Dark Mode */}
      <div className="flex gap-5 items-center">
        {/* Import Button (Conditionally Rendered) */}
        {!hideImport && (
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-500 flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </DialogTrigger>
            {isImportOpen && <ImportBookModal onClose={() => setIsImportOpen(false)} />}
          </Dialog>
        )}

        {/* Notifications */}
        <div className="relative">
           <Bell className="cursor-pointer text-gray-500 dark:text-gray-400" size={24} />
           <span className="absolute -top-1 -right-2 flex items-center justify-center px-1 py-0.5 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
             3
           </span>
         </div>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <div className="flex items-center gap-3 cursor-pointer">
               <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                 {userMetadata?.avatarUrl ? (
                   <Image
                     src={userMetadata.avatarUrl} // Make sure next.config allows this hostname
                     alt="Profile"
                     width={36} // Match container size
                     height={36}
                     className="rounded-full h-full w-full object-cover"
                   />
                 ) : (
                   <User className="w-5 h-5 text-gray-500" /> // Fallback Icon
                 )}
               </div>
               <span className="font-semibold hidden md:inline">{userMetadata?.username || "User"}</span>
             </div>
           </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-black dark:text-white" align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleProfileSettings} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

