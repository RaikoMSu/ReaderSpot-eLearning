'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Bell, Search, Upload, X } from 'lucide-react'
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/(components)/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"

// Assuming you have these components from your UI library
import { Card, CardContent } from "@/app/(components)/ui/card"

interface Book {
  id: string
  title: string
  author: string
  cover: string
  description: string
  genre: string
  year: string
  publisher: string
  language: string
  rating: number
  progress: number
}

const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'Harry Potter and the Goblet of Fire',
    author: 'J.K. Rowling',
    cover: '/placeholder.svg?height=300&width=200',
    description: 'The fourth book in this wildly popular series finds Harry Potter back with his muggle relatives, the Dursleys, where he has just had a very disturbing dream involving his mortal enemy Voldemort, the sorcerer who killed his parents years earlier.',
    genre: 'Fantasy, Adventure',
    year: '2000',
    publisher: 'Bloomsbury Publishing',
    language: 'English',
    rating: 4.7,
    progress: 30,
  },
  // Add more sample books here...
]

export default function HomePage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const openBookPreview = (book: Book) => {
    setSelectedBook(book)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="relative h-[400px] mb-8 rounded-lg overflow-hidden">
          <Image
            src="/placeholder.svg?height=400&width=800"
            alt="Background"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center px-8">
            <h1 className="text-4xl font-bold mb-2">言の葉の庭</h1>
            <h2 className="text-2xl mb-4">The Garden of Words</h2>
            <p className="mb-4 max-w-xl">
              When a lonely teenager skips his morning classes to sit in a lovely
              garden, he meets a mysterious older woman who shares his
              feelings of alienation.
            </p>
            <Button className="w-fit">Continue Reading</Button>
          </div>
        </div>

        {/* Recommended Books */}
        <div>
          <h3 className="text-xl font-semibold mb-4">You may also like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sampleBooks.map((book) => (
              <Card key={book.id} className="bg-gray-800 cursor-pointer" onClick={() => openBookPreview(book)}>
                <CardContent className="p-0">
                  <Image
                    src={book.cover}
                    alt={book.title}
                    width={200}
                    height={300}
                    layout="responsive"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Import Modal */}
        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogTrigger asChild>
            <Button className="fixed bottom-4 right-4 bg-yellow-500 text-black">
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book Import</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add Books</TabsTrigger>
                <TabsTrigger value="imports">My Imports</TabsTrigger>
              </TabsList>
              <TabsContent value="add">
                <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Drag and drop files here</p>
                  <Button className="mt-4">Browse Files</Button>
                </div>
                <ul className="mt-4 text-sm text-gray-500">
                  <li>Only upload books that you have the legal right to share.</li>
                  <li>Avoid sharing bad scans, incomplete e-books, or draft materials.</li>
                  <li>Share books in authorized formats: PDF, FB2, EPUB, LIT, LRF, MOBI, ODT, RTF, SNB, DJVU, AZW3, and AZW.</li>
                  <li>Do not upload magazines, articles, lectures, school or student materials, or any content that you don't have the rights to share.</li>
                </ul>
              </TabsContent>
              <TabsContent value="imports">
                <div className="mt-4">
                  {/* Sample imported books */}
                  <div className="flex items-center space-x-4 py-2">
                    <Image src="/placeholder.svg?height=60&width=40" alt="Book cover" width={40} height={60} />
                    <div>
                      <p className="font-semibold">Harry Potter and the Order of the Phoenix</p>
                      <p className="text-sm text-gray-500">J.K. Rowling</p>
                      <p className="text-xs text-gray-400">Imported: 7 Nov, 2023</p>
                    </div>
                    <span className="ml-auto text-yellow-500">Pending</span>
                  </div>
                  {/* Add more imported books here */}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Book Preview Modal */}
        {selectedBook && (
          <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
            <DialogContent className="sm:max-w-[625px] bg-gray-800">
              <DialogHeader>
                <DialogTitle>{selectedBook.title}</DialogTitle>
              </DialogHeader>
              <div className="flex">
                <Image
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  width={200}
                  height={300}
                  className="rounded-lg"
                />
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">{selectedBook.author}</h3>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">★ {selectedBook.rating.toFixed(1)}/5.0</span>
                    <Button variant="link" className="text-red-500 ml-2">Report</Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-400">
                    Genre: {selectedBook.genre} • Year: {selectedBook.year}<br />
                    Publisher: {selectedBook.publisher} • Language: {selectedBook.language}
                  </p>
                  <Button className="mt-4 bg-yellow-500 text-black">Read</Button>
                </div>
              </div>
              <p className="mt-4">{selectedBook.description}</p>
              <div className="mt-4 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${selectedBook.progress}%` }}
                ></div>
              </div>
              <p className="text-right text-sm text-gray-400">{selectedBook.progress}% completed</p>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}