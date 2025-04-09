import { useState } from 'react';
import { Book } from '@/hooks/useBookRecommendations';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { X, Download, Eye, BookOpen, ExternalLink } from 'lucide-react';

interface BookModalProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onDownloadSuccess?: () => void;
}

export function BookModal({ book, isOpen, onClose, onDownloadSuccess }: BookModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to download books",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      console.log('Sending book to API:', { 
        userId: user.id, 
        bookId: book.id,
        title: book.title
      });
      
      const response = await fetch('/api/mybooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          book,
        }),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
          variant: "default",
        });
        if (onDownloadSuccess) onDownloadSuccess();
      } else {
        console.error('API error:', data);
        
        // Create a more detailed error message
        let errorMessage = data.error || "Failed to download book";
        
        // Add more context if available
        if (data.details) {
          if (typeof data.details === 'object') {
            errorMessage += `: ${data.details.message || JSON.stringify(data.details)}`;
          } else {
            errorMessage += `: ${data.details}`;
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      toast({
        title: "Error",
        description: "Failed to download book. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // External view in Google Books
  const handleViewInGoogleBooks = () => {
    if (book.infoLink) {
      window.open(book.infoLink, '_blank');
    } else {
      toast({
        title: "Not Available",
        description: "Preview not available for this book",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{book.title}</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="flex-shrink-0 w-full md:w-1/3">
              <img 
                src={book.coverImage || '/default-book-cover.jpg'}
                alt={book.title}
                className="w-full h-auto rounded-md object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/default-book-cover.jpg';
                }}
              />
            </div>
            
            {/* Book Details */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {book.authors?.join(', ') || 'Unknown Author'}
              </h3>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from(new Set(book.genres || [])).map((genre, index) => (
                  <span 
                    key={`${genre}-${index}`}
                    className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              
              {/* Rating */}
              {book.averageRating > 0 && (
                <div className="mb-4 flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{book.averageRating.toFixed(1)}</span>
                </div>
              )}
              
              {/* Description */}
              <p className="text-gray-700 mb-4">
                {book.description || 'No description available'}
              </p>
              
              {/* Additional Details */}
              {book.publishedDate && (
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Published:</strong> {book.publishedDate}
                </p>
              )}
              {book.publisher && (
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Publisher:</strong> {book.publisher}
                </p>
              )}
              {book.pageCount && (
                <p className="text-sm text-gray-500 mb-1">
                  <strong>Pages:</strong> {book.pageCount}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer with Actions */}
        <div className="p-4 border-t flex flex-wrap gap-2 justify-end">
          {book.previewLink && (
            <button
              onClick={handleViewInGoogleBooks}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <ExternalLink size={16} />
              View in Google Books
            </button>
          )}
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              isDownloading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <Download size={16} />
            {isDownloading ? 'Adding to Library...' : 'Download to My Books'}
          </button>
        </div>
      </div>
    </div>
  );
} 