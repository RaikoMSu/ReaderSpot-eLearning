'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/(components)/ui/dialog'
import { Button } from '@/app/(components)/ui/button'
import { Progress } from '@/app/(components)/ui/progress'
import { useToast } from '@/app/(components)/ui/use-toast'
import { supabase } from '@/lib/supabase'
import { processBook } from '@/lib/bookProcessor'
import { BookOpen, Upload, AlertCircle, FileType } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

interface ImportBookModalProps {
  onClose: () => void
}

export default function ImportBookModal({ onClose }: ImportBookModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = e.dataTransfer.files
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    // Check file type
    const allowedTypes = ['pdf', 'epub', 'mobi']
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, EPUB, or MOBI files only.",
        variant: "destructive"
      })
      return
    }
    
    // Check file size (limit to 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB.",
        variant: "destructive"
      })
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Create a record in the books table first
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert({
          title: file.name.replace(`.${fileExt}`, '').replace(/[-_\.]/g, ' '),
          author: 'Unknown Author',
          uploader_id: user?.id,
          file_type: fileExt,
          file_size: file.size,
          description: 'This book is currently being processed. Description will be updated automatically.',
          language: 'en', // Default language
          processed: false,
          cover_url: fileExt === 'pdf' 
            ? '/placeholders/pdf-cover.svg' 
            : '/placeholders/epub-cover.svg',
        })
        .select()
      
      if (bookError || !bookData) {
        throw new Error(bookError?.message || 'Error creating book record')
      }
      
      console.log('Created initial book record:', bookData[0].id);
      
      const bookId = bookData[0].id
      const filePath = `${user?.id}/${bookId}.${fileExt}`
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('books')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      // Show progress updates 
      setUploadProgress(50)
      // Create a fake progress animation for better UI feedback
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)
      
      // Clear interval when upload completes or fails
      setTimeout(() => {
        clearInterval(progressInterval)
        setUploadProgress(100)
      }, 2000)
      
      if (uploadError) {
        clearInterval(progressInterval)
        // Clean up the book record if upload fails
        await supabase.from('books').delete().eq('id', bookId)
        throw new Error(uploadError.message)
      }
      
      // Update book record with file URL
      const { data: publicUrlData } = supabase
        .storage
        .from('books')
        .getPublicUrl(filePath)
      
      await supabase
        .from('books')
        .update({
          file_url: publicUrlData.publicUrl,
        })
        .eq('id', bookId)
      
      toast({
        title: "Book uploaded successfully",
        description: "Processing book content...",
      })

      // Ensure the file is publicly accessible before processing
      try {
        // Wait briefly to ensure storage processing is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Log the file URL for debugging
        console.log('Processing book with URL:', publicUrlData.publicUrl);
        
        // Start processing in the background
        processBook(bookId, publicUrlData.publicUrl, fileExt)
          .then(success => {
            if (success) {
              toast({
                title: "Processing complete",
                description: "Your book is ready to read.",
                variant: "success",
              })
              // Set a flag to prevent redirect on page refresh
              localStorage.setItem('noRedirect', 'true')
              // Close modal and redirect to books page
              onClose()
              router.push("/page/books")
            } else {
              toast({
                title: "Processing issues",
                description: "Your book was uploaded but there were some issues processing it. It may have limited functionality.",
              })
            }
          })
          .catch(err => {
            console.error("Error during book processing:", err)
            toast({
              title: "Processing error",
              description: "There was an error processing your book.",
              variant: "destructive",
            })
          })
          .finally(() => {
            setIsUploading(false)
            setUploadProgress(0)
          })
      } catch (error: any) {
        console.error('Error during processing:', error)
        toast({
          title: "Processing error",
          description: error.message || "There was an error processing your book.",
          variant: "destructive",
        })
        setIsUploading(false)
        setUploadProgress(0)
      }
      
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your book.",
        variant: "destructive"
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <DialogContent className="sm:max-w-[550px] bg-white dark:bg-gray-800 text-black dark:text-white">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Import Book</DialogTitle>
        <DialogDescription className="text-gray-500 dark:text-gray-400">
          Upload your ebook files in PDF, EPUB, or MOBI format.
        </DialogDescription>
      </DialogHeader>
      
      <div className="my-4">
        <div 
          className={`border-2 border-dashed rounded-lg p-8 h-64 flex flex-col items-center justify-center text-center transition-colors
            ${dragActive ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' : 'border-gray-300 dark:border-gray-600'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="w-full">
              <div className="mb-4 text-center">
                <Upload className="h-10 w-10 text-yellow-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Uploading book...</p>
              </div>
              <Progress value={uploadProgress} className="h-2 w-full bg-gray-200 dark:bg-gray-700" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <BookOpen className="h-10 w-10 text-yellow-400 mb-2" />
              <h3 className="text-lg font-medium mb-1">Drag and drop your book here</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Supported formats: PDF, EPUB, MOBI</p>
              
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded inline-flex items-center transition-colors">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Browse Files</span>
                </div>
                <input 
                  id="file-upload" 
                  type="file"
                  className="hidden"
                  accept=".pdf,.epub,.mobi" 
                  onChange={handleFileSelect}
                />
              </label>
            </>
          )}
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Tips for best results:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc pl-5">
            <li>EPUB format provides the best reading experience</li>
            <li>Maximum file size is 50MB</li>
            <li>Make sure your ebook has proper metadata for accurate display</li>
          </ul>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  )
} 