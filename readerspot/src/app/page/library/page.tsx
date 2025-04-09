"use client"

import { useState, useEffect } from 'react'
import { useAuth } from "@/app/contexts/AuthContext"
import Image from "next/image"
import { Button } from "@/app/(components)/ui/button"
import { BookCard } from "@/app/(components)/card/BookCard"
import test1 from "@/app/assets/test1.png"
import test2 from "@/app/assets/test2.png"
import test3 from "@/app/assets/test3.png"
import test4 from "@/app/assets/test4.png"
import test5 from "@/app/assets/test5.png"
import test6 from "@/app/assets/test6.png"
import bgimage from "@/app/assets/bgimage.png"
import { Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useBookRecommendations, Book } from '@/hooks/useBookRecommendations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { SUPPORTED_GENRES } from '@/app/api/books/route';
import { BookModal } from '@/components/ui/book-modal';

export default function LibraryPage() {
  const { user, userMetadata } = useAuth()
  const router = useRouter()
  const { books, loading, error, refreshBooks, fetchBooksByGenre } = useBookRecommendations();
  const { toast } = useToast();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [displayedBooks, setDisplayedBooks] = useState<Book[]>([]);
  
  // State for the modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the user's preferred genres
  const [userPreferredGenres, setUserPreferredGenres] = useState<string[]>([]);
  
  // Fetch user preferences for genres
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch(`/api/user/preferences?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.preferred_genres && Array.isArray(data.preferred_genres)) {
            console.log("User preferred genres:", data.preferred_genres);
            setUserPreferredGenres(data.preferred_genres);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user preferences:", error);
      }
    };
    
    fetchUserPreferences();
  }, [user?.id]);

  const handleContinueReading = () => {
    router.push("/page/read/1") // Navigate to the reading page for book ID 1
  }

  useEffect(() => {
    // Clear any loop detection or redirection flags when successfully reaching library
    const clearLoopFlags = () => {
      try {
        console.log("Clearing any loop detection flags on library page");
        localStorage.removeItem('redirectHistory');
        localStorage.removeItem('lastRedirect');
        localStorage.removeItem('noRedirect');
        localStorage.removeItem('recovering_from_loop');
        localStorage.removeItem('force_fresh_login');
        localStorage.removeItem('onboarding_page_loaded');
        localStorage.removeItem('onboarding_last_loaded');
        // Don't remove onboarding_completed status flags
      } catch (e) {
        console.error("Error clearing loop flags:", e);
      }
    };
    
    // When library page loads successfully, this is a safe spot to clear navigation flags
    clearLoopFlags();
    
    // Rest of the initialization code...
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Notice",
        description: "We're experiencing issues with our book service. Showing recommended titles.",
        variant: "default",
      });
    }
  }, [error, toast]);

  // Update displayed books when main books array changes or genre filter changes
  useEffect(() => {
    if (selectedGenre) {
      // Filter books by the selected genre
      setDisplayedBooks(books.filter(book => 
        book.genres.some(genre => 
          genre.toLowerCase() === selectedGenre.toLowerCase())
      ));
    } else {
      // No filter, show all books
      setDisplayedBooks(books);
    }
  }, [books, selectedGenre]);

  const handleGenreSelect = async (genre: string) => {
    if (selectedGenre === genre) {
      // If clicking the already selected genre, clear the filter
      setSelectedGenre(null);
      // Refresh to get the full recommendation list
      refreshBooks();
    } else {
      // Set new genre filter
      setSelectedGenre(genre);
      // Fetch books for this specific genre
      await fetchBooksByGenre(genre);
    }
  };

  // Function to open the modal with the selected book
  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  // Function called after successful download
  const handleDownloadSuccess = () => {
    // Optional: Add any additional actions after successful download
    // For example, you could refresh the list of books or navigate to My Books page
  };

  // Get unique genres from all books to show in filter
  const uniqueGenres = Array.from(
    new Set(
      books.flatMap(book => book.genres)
        .filter(Boolean)
    )
  ).sort();

  // Filter SUPPORTED_GENRES to only show ones that exist in our books
  const availableGenres = SUPPORTED_GENRES.filter(genre => 
    books.some(book => book.genres.some(g => g.toLowerCase() === genre.toLowerCase()))
  );

  // Use the available genres if we have books, otherwise use supported genres
  const genresToShow = books.length > 0 ? availableGenres : SUPPORTED_GENRES.slice(0, 10);

  // Filter and sort genres to prioritize user's preferences
  const sortedGenres = [...genresToShow].sort((a: string, b: string) => {
    const aIsPreferred = userPreferredGenres.includes(a);
    const bIsPreferred = userPreferredGenres.includes(b);
    
    if (aIsPreferred && !bIsPreferred) return -1;
    if (!aIsPreferred && bIsPreferred) return 1;
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Your Library</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Library</h1>
      
      {/* Genre Filter */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Browse by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {sortedGenres.map((genre) => {
            const isUserPreferred = userPreferredGenres.includes(genre);
            return (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedGenre === genre
                    ? 'bg-primary text-primary-foreground'
                    : isUserPreferred 
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {isUserPreferred && <span className="mr-1">★</span>}
                {genre}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, index) => (
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
          ))
        ) : (
          // Display books or empty state
          displayedBooks && displayedBooks.length > 0 ? (
            displayedBooks.map((book) => (
              <Card 
                key={book.id} 
                className="h-[400px] overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleBookClick(book)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {book.authors?.join(', ') || 'Unknown Author'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <div className="relative h-[180px] w-full mb-2">
                    <img
                      src={book.coverImage || '/default-book-cover.jpg'}
                      alt={book.title}
                      className="object-contain w-full h-full rounded-md"
                      onError={(e) => {
                        e.currentTarget.src = '/default-book-cover.jpg';
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                    {book.description || 'No description available'}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-1">
                  <div className="flex gap-2 flex-wrap">
                    {Array.from(new Set(book.genres || ['General']))
                      .slice(0, 2)
                      .map((genre, index) => (
                        <span
                          key={`${book.id}-${genre}-${index}`}
                          className="px-2 py-1 text-xs bg-gray-100 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                  </div>
                  <div className="flex items-center">
                    {book.averageRating > 0 && (
                      <span className="text-sm font-medium">
                        {(book.averageRating || 0).toFixed(1)} ★
                      </span>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            // Empty state
            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-12">
              <p className="text-lg text-gray-500 mb-4">
                {selectedGenre 
                  ? `No books found for genre: ${selectedGenre}` 
                  : 'No books found in your library'}
              </p>
              <button 
                onClick={() => {
                  setSelectedGenre(null);
                  refreshBooks();
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Refresh Recommendations
              </button>
            </div>
          )
        )}
      </div>
      
      {/* Book Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDownloadSuccess={handleDownloadSuccess}
        />
      )}
    </div>
  )
}

