"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, X, Menu, ChevronRight } from "lucide-react"
import { Button } from "@/app/(components)/ui/button"
import { ScrollArea } from "@/app/(components)/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/(components)/ui/sheet"

interface ReadPageProps {
  params: {
    bookId: string
  }
}

export default function ReadPage({ params }: ReadPageProps) {
  const router = useRouter()
  const [showToc, setShowToc] = useState(false)
  const [progress, setProgress] = useState(0)

  // Mock data for the book content
  const bookContent = {
    title: "I Had That Same Dream Again",
    chapters: [
      { id: "1", title: "Copyrights and Credits" },
      { id: "2", title: "Title Page" },
      { id: "3", title: "Chapter 1" },
      { id: "4", title: "Chapter 2" },
      { id: "5", title: "Chapter 3" },
      { id: "6", title: "Chapter 4" },
      { id: "7", title: "Chapter 5" },
      { id: "8", title: "Chapter 6", active: true },
      { id: "9", title: "Chapter 7" },
      { id: "10", title: "Chapter 8" },
      { id: "11", title: "Chapter 9" },
      { id: "12", title: "Chapter 10" },
      { id: "13", title: "Chapter 11" },
      { id: "14", title: "Newsletter" },
    ],
    content: `
      「なんてことしてるの！ 治療しなくちゃ！」
      
      「あ、あんた、何？」
      
      「ばんそうこう持ってるから、これ貼って病院行きましょう！」
      
      「ちょ、あのね、大丈夫だから騒がないでくれる」
      
      慌てる私に対して、南さんはもう落ち着いていました。後から知ったことですが、さすがは高校生さんです。
      
      私は南さんのお願いを聞くため、ひとみ先生に教えてもらった方法でどうにか落ち着こうと思い、すうはあと息をよく吸い込んで吐きました。そうすると私の心に入った空気が隙間を作って、少し大きめのパジャマを着た時みたいに、気持ちがゆるりとするのです。
      
      すーはー。すーはー。すーはー。
      
      気持ちがゆるゆるになった頃、私はやっと南さんにハンカチとばんそうこうを差し出すことに成功しました。すると南さんはしぶしぶ「持ってるよ」と言いながら、自分のハンカチで手首を拭きました。私の出したばんそうこうは、屋上の床に置かれたまま使われませんでした。
    `,
  }

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-medium">{bookContent.title}</h1>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          To exit full screen, press <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">F11</span>
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
              <ul className="space-y-4">
                {bookContent.chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <a
                      href={`#chapter-${chapter.id}`}
                      className={`block py-2 px-4 rounded-md ${chapter.active ? "bg-yellow-400/10 text-yellow-500 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      onClick={() => setShowToc(false)}
                    >
                      {chapter.title}
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8 max-w-3xl mx-auto">
        <div className="space-y-6 text-lg leading-relaxed">
          {bookContent.content.split("\n\n").map((paragraph, index) => (
            <p key={index} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 text-right text-sm text-gray-500 dark:text-gray-400">
          <span>91446 / 124385 (73.52%)</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky bottom-0">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-sm text-gray-500 dark:text-gray-400">Page 42 of 57</div>
        <Button variant="ghost" size="icon">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </footer>
    </div>
  )
}

