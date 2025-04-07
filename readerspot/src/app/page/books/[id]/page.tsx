"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/app/(components)/ui/use-toast'
import { Button } from '@/app/(components)/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/(components)/ui/tabs'
import { ChevronLeft, FileType, BookText, Download, Share, Bookmark, Clock, Edit } from 'lucide-react'
import { Skeleton } from '@/app/(components)/ui/skeleton'

export default function BookPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [book, setBook] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true)
      try {
        // Fetch book data
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (bookError) {
          throw bookError
        }
        
        setBook(bookData)
        
        // Fetch chapters if the book is processed
        if (bookData.processed) {
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('*')
            .eq('book_id', params.id)
            .order('order_index', { ascending: true })
          
          if (chaptersError) {
            console.error('Error fetching chapters:', chaptersError)
          } else {
            setChapters(chaptersData || [])
          }
        }
      } catch (error) {
        console.error('Error fetching book:', error)
        toast({
          title: 'Error',
          description: 'Failed to load book details. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchBook()
  }, [params.id, toast])
  
  const handleReadBook = () => {
    router.push(`/page/read/${params.id}`)
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-[200px]" />
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="h-[400px] w-[280px] rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-12 w-[300px]" />
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
        <p className="mb-4">The book you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/page/books')}>
          Go to Books
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Book Details</h1>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="relative h-[400px] w-[280px] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                {book.file_type === 'pdf' ? (
                  <FileType className="h-24 w-24 text-gray-400" />
                ) : (
                  <BookText className="h-24 w-24 text-gray-400" />
                )}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex flex-col gap-2">
            <Button 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
              onClick={handleReadBook}
            >
              Start Reading
            </Button>
            
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            By {book.author || 'Unknown Author'} • {book.file_type?.toUpperCase()}
          </p>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="prose dark:prose-invert max-w-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Book Info</h3>
                    <ul className="space-y-1">
                      <li className="flex items-center">
                        <span className="min-w-[120px] text-gray-500 dark:text-gray-400">Format:</span> 
                        <span>{book.file_type?.toUpperCase() || 'Unknown'}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="min-w-[120px] text-gray-500 dark:text-gray-400">Language:</span> 
                        <span>{book.language || 'Unknown'}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="min-w-[120px] text-gray-500 dark:text-gray-400">Size:</span> 
                        <span>{book.file_size ? Math.round(book.file_size / 1024 / 1024 * 10) / 10 + 'MB' : 'Unknown'}</span>
                      </li>
                      <li className="flex items-center">
                        <span className="min-w-[120px] text-gray-500 dark:text-gray-400">Uploaded:</span> 
                        <span>{new Date(book.created_at).toLocaleDateString()}</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-2">About this Book</h3>
                <p>{book.description || 'No description available.'}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="chapters">
              {chapters.length > 0 ? (
                <div className="space-y-2">
                  {chapters.map((chapter, index) => (
                    <div 
                      key={chapter.id}
                      className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => router.push(`/page/read/${params.id}?chapter=${index}`)}
                    >
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{chapter.title || `Chapter ${index + 1}`}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium mb-1">No Chapters Available</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {book.processed 
                      ? "This book doesn't have any chapters or the format doesn't support chapter extraction." 
                      : "This book is still being processed. Chapters will appear once processing is complete."}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 