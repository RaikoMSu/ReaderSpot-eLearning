'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, CircleAlert, Star } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"

// Use the helper types to overcome TypeScript issues
type BookType = {
  id: number
  cover: string | null | undefined
  title: string
  author?: string
  description?: string
  progress?: number
}

interface BookModalProps {
  isOpen: boolean
  onClose: () => void
  book: BookType
}

export default function BookModal({ isOpen, onClose, book }: BookModalProps) {
  const router = useRouter()
  
  const handleReadClick = () => {
    router.push(`/page/read/${book.id}`)
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-100 border-gray-200 text-black">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">{book.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mt-4">
          <div className="relative w-32 h-48 flex-shrink-0">
            {/* Use regular img tag to avoid Next.js Image component errors */}
            <img 
              src={book.cover || "/placeholder.svg"} 
              alt={book.title}
              className="rounded-md object-cover w-full h-full"
            />
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-4">
              {book.description || "A captivating story that will take you on an unforgettable journey."}
            </p>
            <p className="text-sm mb-4">
              <span className="text-gray-600">Author: </span>
              <span>{book.author || "Unknown Author"}</span>
            </p>
            
            {book.progress !== undefined && book.progress > 0 && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1 ">
                  <span>Progress</span>
                  <span>{book.progress}%</span>
                </div>
                <Progress value={book.progress} className="h-2 bg-gray-300" />
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleReadClick}
                className="bg-yellow-400 text-black hover:bg-yellow-500 flex-1"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                {book.progress && book.progress > 0 ? 'Continue Reading' : 'Read'}
              </Button>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button variant="outline" className="border-gray-300 bg-gray-100 flex-1 text-yellow-600">
                <Star className="mr-2 h-4 w-4 text-yellow-600" />
                Rate
              </Button>
              <Button variant="outline" className="border-gray-300 bg-gray-100 flex-1 text-red-500">
                <CircleAlert className="mr-2 h-4 w-4 text-red-500" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
