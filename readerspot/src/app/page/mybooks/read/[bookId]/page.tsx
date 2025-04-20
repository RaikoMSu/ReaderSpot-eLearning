'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface BookDetails {
  id: number;
  book_id: string;
  title: string;
  authors: string[];
  description: string;
  cover_image: string;
  preview_link?: string;
  info_link?: string;
}

export default function ReadBookPage() {
  const params = useParams<{ bookId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  // In a real application, this would be the actual book content, potentially fetched from an API
  // For this example, we're using the book description as placeholder content
  const [bookContent, setBookContent] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!user?.id || !params.bookId) {
        setLoading(false);
        setError('Book not found');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch the user's books and find the one with matching bookId
        const response = await fetch(`/api/mybooks?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        
        const books = await response.json();
        const book = books.find((b: any) => b.book_id === params.bookId);
        
        if (!book) {
          setError('Book not found in your library');
          router.push('/page/mybooks');
          return;
        }
        
        setBookDetails(book);
        
        // In a real app, you would fetch the actual book content here
        // For now, we'll use the description as placeholder content
        if (book.description) {
          // Create some dummy content for demo purposes
          const dummyContent = createDummyContent(book.description);
          setBookContent(dummyContent);
        }
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load book details');
        
        toast({
          title: "Error",
          description: "Failed to load book. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [user?.id, params.bookId, router, toast]);
  
  // Create some dummy content for demo purposes
  const createDummyContent = (description: string) => {
    // Repeat the description to create longer text
    let content = '';
    for (let i = 0; i < 10; i++) {
      content += `${description}\n\n`;
    }
    return content;
  };
  
  // Navigate to the next page
  const nextPage = () => {
    setCurrentPage(prev => prev + 1);
  };
  
  // Navigate to the previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  // Open the book in Google Books for full reading experience
  const openInGoogleBooks = () => {
    if (bookDetails?.preview_link) {
      window.open(bookDetails.preview_link, '_blank');
    } else if (bookDetails?.info_link) {
      window.open(bookDetails.info_link, '_blank');
    } else {
      toast({
        title: "Not Available",
        description: "Online preview is not available for this book",
        variant: "destructive",
      });
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse flex flex-col">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !bookDetails) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-4">Sorry, we couldn't load this book</h2>
          <p className="text-gray-500 mb-6">{error || 'Book not found'}</p>
          <Link
            href="/page/mybooks"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Return to My Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/page/mybooks"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span>Back to My Books</span>
        </Link>
        
        <button
          onClick={openInGoogleBooks}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <ExternalLink size={16} />
          Read in Google Books
        </button>
      </div>
      
      {/* Book Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{bookDetails.title}</h1>
        <p className="text-gray-600 mb-4">by {bookDetails.authors?.join(', ') || 'Unknown Author'}</p>
      </div>
      
      {/* Reader */}
      <div className="bg-white border rounded-lg p-8 mb-8 min-h-[60vh] flex flex-col">
        <div className="flex-grow">
          {/* Display a section of the book content based on the current page */}
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">
              {/* In a real app, this would show actual book content */}
              {`Page ${currentPage}: ${bookContent}`}
            </p>
          </div>
        </div>
        
        {/* Page Navigation */}
        <div className="flex justify-between items-center pt-4 mt-auto border-t">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              currentPage <= 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={16} />
            Previous Page
          </button>
          
          <span className="text-gray-500">Page {currentPage}</span>
          
          <button
            onClick={nextPage}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Next Page
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Book Cover */}
      <div className="w-full max-w-sm mx-auto">
        {!imageError ? (
          <img
            src={bookDetails.cover_image || '/default-book-cover.jpg'}
            alt={bookDetails.title}
            className="w-full h-auto rounded-md shadow-md"
            onError={handleImageError}
          />
        ) : (
          <img
            src="/default-book-cover.jpg"
            alt={bookDetails.title}
            className="w-full h-auto rounded-md shadow-md"
          />
        )}
      </div>
    </div>
  );
} 