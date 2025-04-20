'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/app/(components)/ui/button';
import { Upload, FileText, X, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/app/(components)/ui/dialog';

export function EpubUploader({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    // Validate file type
    if (file.type !== 'application/epub+zip' && !file.name.endsWith('.epub')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an EPUB file (.epub)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file || !user?.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('filename', file.name);

      console.log('Starting upload for file:', file.name);
      
      // Start progress simulation immediately to ensure it begins
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 90) {
          progress = 90;
        }
        setUploadProgress(progress);
        console.log('Upload progress:', progress);
      }, 200);

      // Upload the file
      console.log('Sending fetch request to /api/epub/upload');
      const response = await fetch('/api/epub/upload', {
        method: 'POST',
        body: formData,
      });

      // Stop the progress simulation when upload is complete
      clearInterval(progressInterval);
      setUploadProgress(100);
      console.log('Upload completed, response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('Upload error response:', error);
        throw new Error(error.error || 'Failed to upload EPUB file');
      }

      const data = await response.json();
      console.log('Upload success response:', data);
      
      toast({
        title: "Upload Successful",
        description: `"${file.name}" has been added to your library`,
        variant: "default",
      });

      // Close modal and navigate to my books page after a short delay
      setTimeout(() => {
        onClose();
        router.push('/page/mybooks');
        router.refresh(); // Refresh the page to show the new book
      }, 1500);
    } catch (error) {
      console.error('Error uploading EPUB:', error);
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Failed to upload EPUB file',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <DialogContent className="sm:max-w-[550px] bg-white dark:bg-gray-800 text-black dark:text-white">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold">Upload EPUB Book</DialogTitle>
        <DialogDescription className="text-gray-500 dark:text-gray-400">
          Add an EPUB ebook to your personal library.
        </DialogDescription>
      </DialogHeader>

      <div
        className={`border-2 border-dashed rounded-lg p-8 ${
          isDragging 
            ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10' 
            : file 
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
              : 'border-gray-300 dark:border-gray-600'
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {!file ? (
            <>
              <Upload size={48} className="text-gray-400 dark:text-gray-500" />
              <div className="text-center">
                <p className="text-lg font-medium">Drag & Drop your EPUB book here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to select a file</p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleButtonClick}
                className="mt-4"
              >
                <FileText className="mr-2 h-4 w-4" /> 
                Select EPUB File
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".epub"
                onChange={handleFileChange}
                className="hidden"
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Check size={24} className="text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400 truncate max-w-[240px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              {isUploading ? (
                <div className="w-full mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-center mt-2">
                    Uploading... {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={handleUpload}
                  className="mt-4 w-full bg-yellow-400 text-black hover:bg-yellow-500 dark:text-black"
                >
                  <Upload className="mr-2 h-4 w-4" /> 
                  Upload Book
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Supported Format</h3>
        <ul className="list-disc list-inside">
          <li>EPUB (.epub) - Maximum file size: 20MB</li>
        </ul>
        <p className="mt-2">
          After upload, your book will be added to your personal library and you can read it anytime.
        </p>
      </div>

      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onClose}
          className="mt-4"
        >
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
} 