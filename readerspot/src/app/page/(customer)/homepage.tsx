'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/app/(components)/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/(components)/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/(components)/ui/tabs"
import { Input } from "@/app/(components)/ui/input"
import { Badge } from "@/app/(components)/ui/badge"
import { Cloud, Search } from 'lucide-react'
import { BookCard } from '@/app/(components)/card/BookCard'
import test1 from '@/app/assets/test1.png'
import test2 from '@/app/assets/test2.png'
import test3 from '@/app/assets/test3.png'
import test4 from '@/app/assets/test4.png'
import test5 from '@/app/assets/test5.png'
import test6 from '@/app/assets/test6.png'
import bgimage from '@/app/assets/bgimage.png'


export default function HomePage() {
  const books = [
    { id: 1, cover: test1, title: 'Just Because', progress: 75 },
    { id: 2, cover: test2, title: 'Wait For Me Yesterday in Spring', progress: 30 },
    { id: 3, cover: test3, title: 'Wish You a Merry Christmas', progress: 100 },
    { id: 4, cover: test4, title: 'I Am Blue in Pain and Fragile', progress: 50 },
    { id: 5, cover: test5, title: 'Maskara', progress: 0 },
    { id: 6, cover: test6, title: 'Even If This Love Disappears Tonight', progress: 10 },
  ]

  const importedBooks = [
    { id: 1, cover: '/placeholder.svg', title: 'Harry Potter and the Order of the Phoenix', author: 'J.K. Rowling', status: 'pending' },
    { id: 2, cover: '/placeholder.svg', title: 'Harry Potter and the Goblet of Fire', author: 'J.K. Rowling', status: 'paid' },
    { id: 3, cover: '/placeholder.svg', title: 'I Had That Same Dream Again', author: 'Yoru Sumino', status: 'free' },
  ]

  return (
    <div className="min-h-screen w-full text-white">
      {/* Assume TopNav and SideNav components are already implemented.  The Dialog content will be moved here. */}
      <main className="p-6">
        <div className="relative h-[400px] rounded-lg overflow-hidden mb-8">
          <Image
            src={bgimage}
            alt="The Garden of Words"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-10 flex flex-col justify-center p-8">
            <h1 className="text-6xl font-bold mb-6">言の葉の庭</h1>
            <h2 className="text-2xl mb-4">The Garden of Words</h2>
            <p className="mb-4 max-w-xl">
              When a lonely teenager skips his morning classes to sit in a lovely
              garden, he meets a mysterious older woman who shares his
              feelings of alienation.
            </p>
            <Button className='flex justify-between items-center pl-3.5 w-[140px] mt-6 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-500 hover:to-yellow-600 shadow-sm'>Continue Reading</Button>

          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-4 text-gray-900">You may also like</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            cover={book.cover}
            title={book.title}
            progress={book.progress}
          />
        ))}
      </div>

      </main>
    </div>
  )
}