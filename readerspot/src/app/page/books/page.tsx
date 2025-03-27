"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/app/(components)/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import { BookCard } from "@/app/(components)/card/BookCard"
import test1 from "@/app/assets/test1.png"
import test2 from "@/app/assets/test2.png"
import test3 from "@/app/assets/test3.png"
import test4 from "@/app/assets/test4.png"
import test5 from "@/app/assets/test5.png"
import test6 from "@/app/assets/test6.png"

export default function BooksPage() {
  const router = useRouter()

  const books = [
    { id: 1, cover: test1, title: "Just Because", author: "Hajime Kamoshida", progress: 75 },
    { id: 2, cover: test2, title: "Wait For Me Yesterday in Spring", author: "Mei Hachimoku", progress: 30 },
    { id: 3, cover: test3, title: "Wish You a Merry Christmas", author: "Yoru Sumino", progress: 100 },
    { id: 4, cover: test4, title: "I Am Blue in Pain and Fragile", author: "Yoru Sumino", progress: 50 },
    { id: 5, cover: test5, title: "Maskara", author: "Imamurahitoshi", progress: 0 },
    { id: 6, cover: test6, title: "Even If This Love Disappears Tonight", author: "Misaki Ichijo", progress: 10 },
  ]

  const categories = [
    { id: "all", name: "All Books" },
    { id: "reading", name: "Currently Reading" },
    { id: "completed", name: "Completed" },
    { id: "wishlist", name: "Wishlist" },
  ]

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Books</h1>
        <Button
          className="bg-yellow-400 text-black hover:bg-yellow-500"
          onClick={() => router.push("/page/books/learn")}
        >
          Learn UI
        </Button>
      </div>

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
                cover={book.cover}
                title={book.title}
                author={book.author}
                progress={book.progress}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reading" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {books
              .filter((book) => book.progress > 0 && book.progress < 100)
              .map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  cover={book.cover}
                  title={book.title}
                  author={book.author}
                  progress={book.progress}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {books
              .filter((book) => book.progress === 100)
              .map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  cover={book.cover}
                  title={book.title}
                  author={book.author}
                  progress={book.progress}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="wishlist" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {books
              .filter((book) => book.progress === 0)
              .map((book) => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  cover={book.cover}
                  title={book.title}
                  author={book.author}
                  progress={book.progress}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

