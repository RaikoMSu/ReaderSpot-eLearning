'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { BookOpen, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/app/(components)/ui/button';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface MyBook {
  id: number;
  user_id: string;
  book_id: string;
  title: string;
  authors: string[];
  description: string;
  cover_image: string;
  genres: string[];
  average_rating: number;
  preview_link?: string;
  info_link?: string;
  added_at: string;
}

export default function MyBooksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [books, setBooks] = useState<MyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchMyBooks = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/mybooks?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch your books');
        }
        
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch your books');
        
        toast({
          title: "Error",
          description: "Failed to load your books. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchMyBooks();
  }, [user?.id, toast, refreshKey]);

  // Force a refresh when navigating to this page
  useEffect(() => {
    if (pathname === '/page/mybooks') {
      setRefreshKey(prev => prev + 1);
    }
  }, [pathname]);

  const handleRemoveBook = async (bookId: string) => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/mybooks?userId=${user.id}&bookId=${bookId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove book');
      }
      
      // Remove the book from the local state
      setBooks(books.filter(book => book.book_id !== bookId));
      
      toast({
        title: "Success",
        description: "Book removed from your collection",
        variant: "default",
      });
    } catch (err) {
      console.error('Error removing book:', err);
      
      toast({
        title: "Error",
        description: "Failed to remove book. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageError = (bookId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [bookId]: true
    }));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Books</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      {loading ? (
        // Loading skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="h-[400px]">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : books.length > 0 ? (
        // Display user's books
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <Card key={book.id} className="h-[400px] overflow-hidden flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {book.authors?.join(', ') || 'Unknown Author'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="relative h-[180px] w-full mb-2 flex items-center justify-center">
                  {!imageErrors[book.book_id] ? (
                    <img
                      src={book.cover_image || '/default-book-cover.jpg'}
                      alt={book.title}
                      className="max-h-full max-w-full object-contain rounded-md"
                      onError={() => handleImageError(book.book_id)}
                    />
                  ) : (
                    <img
                      src="/default-book-cover.jpg"
                      alt={book.title}
                      className="max-h-full max-w-full object-contain rounded-md"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                  {book.description || 'No description available'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-1">
                <Link 
                  href={`/page/mybooks/read/${book.book_id}`}
                  className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  <BookOpen size={16} />
                  Read
                </Link>
                <button
                  onClick={() => handleRemoveBook(book.book_id)}
                  className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 p-6 bg-gray-100 rounded-full">
            <BookOpen size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Your library is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Download books from the library to read them offline and keep track of your reading progress.
          </p>
          <Link
            href="/page/library"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Library
          </Link>
        </div>
      )}
    </div>
  );
} 