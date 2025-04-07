"use client"

import { useEffect } from "react"
import { useAuth } from "@/app/contexts/AuthContext"
import Image from "next/image"
import { Button } from "@/app/(components)/ui/button"
import { BookCard } from "@/app/(components)/card/BookCard"
import test1 from "@/app/assets/test1.png"
import test2 from "@/app/assets/test2.png"
import test3 from "@/app/assets/test3.png"
import test4 from "@/app/assets/test4.png"
import test5 from "@/app/assets/test5.png"
import test6 from "@/app/assets/test6.png"
import bgimage from "@/app/assets/bgimage.png"
import { Play } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LibraryPage() {
  const { user, userMetadata } = useAuth()
  const router = useRouter()
  const books = [
    { id: 1, cover: test1, title: "Just Because", progress: 75 },
    { id: 2, cover: test2, title: "Wait For Me Yesterday in Spring", progress: 30 },
    { id: 3, cover: test3, title: "Wish You a Merry Christmas", progress: 100 },
    { id: 4, cover: test4, title: "I Am Blue in Pain and Fragile", progress: 50 },
    { id: 5, cover: test5, title: "Maskara", progress: 0 },
    { id: 6, cover: test6, title: "Even If This Love Disappears Tonight", progress: 10 },
  ]

  const handleContinueReading = () => {
    router.push("/page/read/1") // Navigate to the reading page for book ID 1
  }

  useEffect(() => {
    // Clear any loop detection or redirection flags when successfully reaching library
    const clearLoopFlags = () => {
      try {
        console.log("Clearing any loop detection flags on library page");
        localStorage.removeItem('redirectHistory');
        localStorage.removeItem('lastRedirect');
        localStorage.removeItem('noRedirect');
        localStorage.removeItem('recovering_from_loop');
        localStorage.removeItem('force_fresh_login');
        localStorage.removeItem('onboarding_page_loaded');
        localStorage.removeItem('onboarding_last_loaded');
        // Don't remove onboarding_completed status flags
      } catch (e) {
        console.error("Error clearing loop flags:", e);
      }
    };
    
    // When library page loads successfully, this is a safe spot to clear navigation flags
    clearLoopFlags();
    
    // Rest of the initialization code...
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Library</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-lg">Welcome, {userMetadata?.username || 'Reader'}</p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Your personal reading space</p>
      </div>

      {/* Featured Book Banner */}
      <div className="relative h-[400px] rounded-lg overflow-hidden mb-8 mt-8">
        <Image 
          src={bgimage || "/placeholder.svg"} 
          alt="The Garden of Words" 
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-end p-8">
          <h1 className="text-6xl font-bold mb-2 text-white">言の葉の庭</h1>
          <h2 className="text-2xl mb-4 text-white">The Garden of Words</h2>
          <p className="mb-6 max-w-xl text-white">
            When a lonely teenager skips his morning classes to sit in a lovely garden, he meets a mysterious older
            woman who shares his feelings of alienation.
          </p>
          <div className="flex items-center gap-4">
            <Button
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-md"
              onClick={handleContinueReading}
            >
              Continue Reading
            </Button>
            <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Book Recommendations */}
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">You may also like</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} id={book.id} cover={book.cover} title={book.title} progress={book.progress} />
        ))}
      </div>
    </div>
  )
}

