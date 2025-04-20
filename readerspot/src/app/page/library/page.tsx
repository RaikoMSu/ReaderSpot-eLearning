"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from "@/app/contexts/AuthContext"
import Link from 'next/link'
import Image from "next/image"
import { Button } from "@/app/(components)/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { StarIcon, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import { useBookRecommendations, Book } from '@/hooks/useBookRecommendations';
import { BookDetailsModal } from '@/components/BookDetailsModal';

export default function LibraryPage() {
  const { user } = useAuth();
  const { books, loading, error, fetchBooksByGenre } = useBookRecommendations();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Available genres (you can expand this list as needed)
  const genres = ["Fantasy", "Mystery", "Romance", "Science Fiction", "Thriller", "Non-Fiction"];
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);
  
  useEffect(() => {
    if (selectedGenre) {
      fetchBooksByGenre(selectedGenre);
    }
  }, [selectedGenre, fetchBooksByGenre]);
  
  const handleGenreClick = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? null : genre);
  };

  const handleImageError = (bookId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [bookId]: true
    }));
  };

  const handleBookDetails = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Book Recommendations</h1>
          <p className="text-gray-600">
            Discover books tailored to your reading preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden h-[400px]">
              <div className="h-[200px] bg-gray-200">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Book Recommendations</h1>
        <p className="text-gray-600">
          Discover books tailored to your reading preferences
        </p>
      </div>

      {/* Genre Filter */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Filter by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Button
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              onClick={() => handleGenreClick(genre)}
              className="text-sm"
            >
              {genre}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden h-[400px] flex flex-col">
            <div className="relative h-[200px] bg-gray-100">
              {book.coverImage && !imageErrors[book.id] ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={book.coverImage}
                    alt={`Cover of ${book.title}`}
                    className="max-w-full max-h-full object-contain"
                    onError={() => handleImageError(book.id)}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No cover available</span>
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
              <CardDescription className="line-clamp-1">
                {book.authors?.join(', ') || 'Unknown author'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                {book.description || 'No description available'}
              </p>
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {book.genres.slice(0, 3).map((genre, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                    >
                      {genre}
                    </span>
                  ))}
                  {book.genres.length > 3 && (
                    <span className="text-xs text-gray-500">+{book.genres.length - 3} more</span>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 flex justify-between items-center">
              <div className="flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm">{book.averageRating ? book.averageRating.toFixed(1) : 'N/A'}</span>
              </div>
              <Button 
                variant="link"
                className="text-sm text-blue-600 p-0 h-auto font-normal"
                onClick={() => handleBookDetails(book)}
              >
                View details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Book Details Modal */}
      <BookDetailsModal 
        book={selectedBook}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

