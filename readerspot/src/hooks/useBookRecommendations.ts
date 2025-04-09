import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverImage: string;
  genres: string[];
  averageRating: number;
  primaryGenre?: string;
  pageCount?: number;
  publishedDate?: string;
  publisher?: string;
  previewLink?: string;
  infoLink?: string;
}

export const useBookRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  // Function to manually trigger a refresh
  const refreshBooks = useCallback(() => {
    setFetchTrigger(prev => prev + 1);
  }, []);

  // Function to fetch books by a specific genre
  const fetchBooksByGenre = useCallback(async (genre: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/books?genre=${encodeURIComponent(genre)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `Error fetching books for genre: ${genre}`);
      }
      
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books by genre:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch book recommendations');
      
      toast({
        title: "Error Loading Books",
        description: err instanceof Error ? err.message : 'Failed to fetch books, please try again later',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchBooks = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/books?userId=${user.id}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Network error' }));
          throw new Error(errorData.error || 'Failed to fetch book recommendations');
        }
        
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching book recommendations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch book recommendations');
        
        toast({
          title: "Error Loading Recommendations",
          description: "We couldn't load your personalized book recommendations. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user?.id, fetchTrigger, toast]);

  return { 
    books, 
    loading, 
    error, 
    refreshBooks, 
    fetchBooksByGenre 
  };
}; 