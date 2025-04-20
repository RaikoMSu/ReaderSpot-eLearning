'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Book } from '@/hooks/useBookRecommendations';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/app/(components)/ui/button';
import { DownloadCloud, Star, ExternalLink, Bookmark, BookOpen, CheckCircle2 } from 'lucide-react';

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookDetailsModal({ book, isOpen, onOpenChange }: BookDetailsModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    if (!user?.id || !book) return;

    setDownloading(true);
    setDownloadSuccess(false);

    try {
      // Prepare the payload according to the database schema field names
      const bookData = {
        id: book.id,
        book_id: book.id,             // Required by database schema
        title: book.title,
        authors: book.authors,
        description: book.description,
        cover_image: book.coverImage,  // Use snake_case for DB fields
        genres: book.genres,
        average_rating: book.averageRating,  // Use snake_case for DB fields
        preview_link: book.previewLink,     // Use snake_case for DB fields
        info_link: book.infoLink,          // Use snake_case for DB fields
      };

      console.log('Sending book data to API:', { userId: user.id, book: bookData });

      const response = await fetch('/api/mybooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          book: bookData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || 'Failed to download book');
      }

      const result = await response.json();
      console.log('API success response:', result);

      setDownloadSuccess(true);
      toast({
        title: 'Book Added',
        description: `"${book.title}" has been added to your library`,
        variant: 'default',
      });

    } catch (error) {
      console.error('Error downloading book:', error);
      toast({
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Failed to add book to your library',
        variant: 'destructive',
      });
      setDownloadSuccess(false);
    } finally {
      setDownloading(false);
    }
  };

  const handleGoToMyBooks = () => {
    onOpenChange(false);
    router.push('/page/mybooks');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{book.title}</DialogTitle>
          <DialogDescription>
            by {book.authors?.join(', ') || 'Unknown Author'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6 py-4">
          {/* Book Cover */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[250px] aspect-[2/3] bg-gray-100 rounded-md overflow-hidden shadow-md">
              {!imageError ? (
                <img
                  src={book.coverImage || '/default-book-cover.jpg'}
                  alt={`Cover of ${book.title}`}
                  className="object-cover w-full h-full"
                  onError={handleImageError}
                />
              ) : (
                <img
                  src="/default-book-cover.jpg"
                  alt={`Cover of ${book.title}`}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className="flex flex-col space-y-4">
            {/* Rating */}
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-lg font-medium">{book.averageRating ? book.averageRating.toFixed(1) : 'N/A'}/5</span>
            </div>

            {/* Genres */}
            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {book.genres.map((genre, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 text-sm">
                {book.description || 'No description available.'}
              </p>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {book.pageCount && (
                <div>
                  <span className="font-medium">Pages:</span> {book.pageCount}
                </div>
              )}
              {book.publisher && (
                <div>
                  <span className="font-medium">Publisher:</span> {book.publisher}
                </div>
              )}
              {book.publishedDate && (
                <div>
                  <span className="font-medium">Published:</span> {book.publishedDate}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Download Status */}
          {downloadSuccess && (
            <div className="flex items-center text-green-600 mr-auto">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              <span>Added to your library!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* External Link Button */}
            {(book.previewLink || book.infoLink) && (
              <Button
                variant="outline"
                onClick={() => window.open(book.previewLink || book.infoLink, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Preview on Google Books
              </Button>
            )}

            {/* Download Button */}
            {!downloadSuccess ? (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Adding to Library...
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    Add to My Books
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleGoToMyBooks}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <BookOpen className="h-4 w-4" />
                Go to My Books
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 