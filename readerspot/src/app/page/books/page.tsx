"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/(components)/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import { BookCard } from "@/app/(components)/card/BookCard"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/app/contexts/AuthContext"
import { Loader2 } from "lucide-react"
import { useToast } from "@/app/(components)/ui/use-toast"

interface Book {
  id: string
  title: string
  author: string
  cover_url: string | null
  file_type: string
  progress: number
  processed: boolean
}

interface BookData extends Omit<Book, 'progress'> {
  created_at?: string
  [key: string]: any
}

export default function BooksPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true)
      try {
        if (!user) return

        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('uploader_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Transform the data to include progress
        setBooks(data.map((book: BookData) => ({
          ...book,
          progress: 0, // Will be updated with real progress in the future
        })))
      } catch (error) {
        console.error('Error fetching books:', error)
        toast({
          title: 'Error fetching books',
          description: 'Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [user, toast])

  const categories = [
    { id: "all", name: "All Books" },
    { id: "reading", name: "Currently Reading" },
    { id: "completed", name: "Completed" },
    { id: "wishlist", name: "Wishlist" },
  ]

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mt-8 dark:text-white">My Books</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-yellow-400" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">No books yet</h2>
          <p className="text-gray-500 mb-6">Import your first book to get started</p>
          <p className="text-gray-500">Click the Import button in the navigation bar to add books</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full mb-8">
          <TabsList className="grid grid-cols-4 mb-8 bg-gray-100 dark:bg-gray-800">
            {categories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  cover={book.cover_url || "/placeholder.svg"}
                  title={book.title || `Untitled ${book.file_type?.toUpperCase()}`}
                  author={book.author || "Unknown"}
                  progress={book.processed ? 100 : 50}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reading" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {books
                .filter((book) => book.processed && book.progress > 0 && book.progress < 100)
                .map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    cover={book.cover_url || "/placeholder.svg"}
                    title={book.title || `Untitled ${book.file_type?.toUpperCase()}`}
                    author={book.author || "Unknown"}
                    progress={book.progress}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {books
                .filter((book) => book.processed && book.progress === 100)
                .map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    cover={book.cover_url || "/placeholder.svg"}
                    title={book.title || `Untitled ${book.file_type?.toUpperCase()}`}
                    author={book.author || "Unknown"}
                    progress={book.progress}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="wishlist" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {books
                .filter((book) => !book.processed || book.progress === 0)
                .map((book) => (
                  <BookCard
                    key={book.id}
                    id={book.id}
                    cover={book.cover_url || "/placeholder.svg"}
                    title={book.title || `Untitled ${book.file_type?.toUpperCase()}`}
                    author={book.author || "Unknown"}
                    progress={book.progress}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

