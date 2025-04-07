"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, X, Menu, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/app/(components)/ui/button"
import { ScrollArea } from "@/app/(components)/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/(components)/ui/sheet"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/app/(components)/ui/use-toast"

interface ReadPageProps {
  params: {
    bookid: string
  }
}

export default function ReadPage({ params }: ReadPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [showToc, setShowToc] = useState(false)
  const [progress, setProgress] = useState(0)
  const [book, setBook] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [currentChapter, setCurrentChapter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chapterContent, setChapterContent] = useState("")
  
  // Get chapter index from URL param or default to 0
  const chapterIndex = parseInt(searchParams.get('chapter') || '0')

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true)
      try {
        // Fetch book data
        const { data: bookData, error: bookError } = await supabase
          .from('books')
          .select('*')
          .eq('id', params.bookid)
          .single()
        
        if (bookError) {
          throw bookError
        }
        
        setBook(bookData)
        
        // Fetch chapters
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('book_id', params.bookid)
          .order('order_index', { ascending: true })
        
        if (chaptersError) {
          throw chaptersError
        }
        
        setChapters(chaptersData || [])
        
        // Set current chapter
        if (chaptersData && chaptersData.length > 0) {
          const chapter = chaptersData[Math.min(chapterIndex, chaptersData.length - 1)]
          setCurrentChapter(chapter)
          setChapterContent(chapter.content)
        } else if (bookData.file_type === 'pdf') {
          // For PDFs, we provide a link to view directly
          setChapterContent(`
            <div class="text-center py-12">
              <p class="mb-4">This is a PDF document and needs to be viewed in a PDF viewer.</p>
              <a href="${bookData.file_url}" target="_blank" class="px-4 py-2 bg-yellow-400 text-black rounded">
                Open PDF
              </a>
            </div>
          `)
        } else {
          setChapterContent("No content available for this book.")
        }
      } catch (error) {
        console.error('Error fetching book:', error)
        toast({
          title: 'Error',
          description: 'Failed to load book content. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchBookData()
  }, [params.bookid, chapterIndex, toast])

  useEffect(() => {
    // Calculate progress based on scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const scrollPercentage = (scrollPosition / (docHeight - windowHeight)) * 100
      setProgress(Math.min(Math.round(scrollPercentage), 100))
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  const navigateToChapter = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      router.push(`/page/read/${params.bookid}?chapter=${index}`)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium truncate max-w-[200px] md:max-w-md">
            {book?.title || 'Loading...'}
          </h1>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
          {currentChapter?.title || 'Chapter'}
        </div>

        <Sheet open={showToc} onOpenChange={setShowToc}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[300px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
          >
            <SheetHeader>
              <SheetTitle className="text-left">Table of Contents</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-100px)] mt-6">
              {loading ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : chapters.length > 0 ? (
                <ul className="space-y-4">
                  {chapters.map((chapter, index) => (
                    <li key={chapter.id}>
                      <a
                        href={`/page/read/${params.bookid}?chapter=${index}`}
                        className={`block py-2 px-4 rounded-md ${
                          index === chapterIndex
                            ? "bg-yellow-400/10 text-yellow-500 font-medium"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={(e) => {
                          e.preventDefault()
                          setShowToc(false)
                          navigateToChapter(index)
                        }}
                      >
                        {chapter.title || `Chapter ${index + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No chapters available for this book.
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-yellow-400 mb-4" />
            <p className="text-gray-500">Loading chapter content...</p>
          </div>
        ) : (
          <div className="space-y-6 text-lg leading-relaxed">
            {chapterContent.includes('<') ? (
              <div dangerouslySetInnerHTML={{ __html: chapterContent }} />
            ) : (
              chapterContent.split("\n\n").map((paragraph, index) => (
                <p key={index} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))
            )}
          </div>
        )}

        <div className="mt-8 text-right text-sm text-gray-500 dark:text-gray-400">
          <span>Progress: {progress}%</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky bottom-0">
        <Button 
          variant="ghost" 
          size="icon"
          disabled={chapterIndex <= 0 || loading}
          onClick={() => navigateToChapter(chapterIndex - 1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Loading...' : chapters.length > 0 ? `Chapter ${chapterIndex + 1} of ${chapters.length}` : 'No chapters'}
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          disabled={chapterIndex >= chapters.length - 1 || loading}
          onClick={() => navigateToChapter(chapterIndex + 1)}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  )
}

