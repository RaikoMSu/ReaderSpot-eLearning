import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Common genres supported by Google Books API
export const SUPPORTED_GENRES = [
  'Adventure',
  'Art',
  'Biography',
  'Business',
  'Children',
  'Classics',
  'Comics',
  'Cooking',
  'Crime',
  'Drama',
  'Fantasy',
  'Fiction',
  'History',
  'Horror',
  'Humor',
  'Mystery',
  'Nonfiction',
  'Philosophy',
  'Poetry',
  'Psychology',
  'Religion',
  'Romance',
  'Science',
  'Science Fiction',
  'Self-Help',
  'Sports',
  'Thriller',
  'Travel',
  'Young Adult'
];

// Sample data for fallback only if API completely fails
const sampleBooks = [
  {
    id: 'sample1',
    title: 'The Midnight Library',
    authors: ['Matt Haig'],
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg',
    genres: ['Fiction', 'Fantasy'],
    averageRating: 4.2
  },
  {
    id: 'sample2',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving every day.',
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1535115320i/40121378.jpg',
    genres: ['Self-Help', 'Productivity'],
    averageRating: 4.5
  },
  {
    id: 'sample3',
    title: 'The Silent Patient',
    authors: ['Alex Michaelides'],
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas.",
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1582759969i/40097951.jpg',
    genres: ['Thriller', 'Mystery'],
    averageRating: 4.1
  },
  {
    id: 'sample4',
    title: 'Project Hail Mary',
    authors: ['Andy Weir'],
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the Earth itself will perish.",
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg',
    genres: ['Science Fiction', 'Space'],
    averageRating: 4.8
  },
  {
    id: 'sample5',
    title: 'The Alchemist',
    authors: ['Paulo Coelho'],
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1654371463i/18144590.jpg',
    genres: ['Fiction', 'Philosophy'],
    averageRating: 4.3
  },
  {
    id: 'sample6',
    title: 'Educated',
    authors: ['Tara Westover'],
    description: "An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.",
    coverImage: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1506026635i/35133922.jpg',
    genres: ['Memoir', 'Biography'],
    averageRating: 4.6
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const genre = searchParams.get('genre'); // Optional parameter for direct genre search

    if (!userId && !genre) {
      return NextResponse.json(
        { error: 'Either userId or genre parameter is required' },
        { status: 400 }
      );
    }

    // API key validation
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    if (!apiKey) {
      console.error('Google Books API key not configured');
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    let genresToSearch = [];

    // If direct genre is provided, use it
    if (genre) {
      genresToSearch = [genre];
    } 
    // Otherwise fetch from user preferences
    else if (userId) {
      try {
        console.log('Books API - Fetching preferences for user ID:', userId);
        
        // Fetch user preferences from the correct table - using maybeSingle() instead of single()
        // to handle missing rows gracefully without error
        const { data: userPreferences, error: preferencesQueryError } = await supabase
          .from('user_preferences')
          .select('*')  // Select all columns to get a better picture of the data
          .eq('user_id', userId)
          .maybeSingle();  // Use maybeSingle() instead of single() to avoid PGRST116 error

        // Log full results for debugging
        console.log('Books API - Full preferences data:', userPreferences);
        
        if (preferencesQueryError) {
          // A real database error occurred (not just missing rows)
          console.error('Books API - Database error:', preferencesQueryError);
          genresToSearch = ['Fiction', 'Mystery', 'Science Fiction'];
        } else if (!userPreferences) {
          // No preferences found for this user
          console.log('Books API - No preferences found for user, using default genres');
          genresToSearch = ['Fiction', 'Mystery', 'Science Fiction'];
        } else {
          // Found preferences, now handle different field name possibilities
          console.log('Books API - Found user preferences:', userPreferences);
          
          // Check different possible field names based on the error
          const genres = userPreferences.preferred_genres || 
                         userPreferences.preferredGenres || 
                         userPreferences.preferred_genre ||
                         userPreferences.genre_preferences;
          
          if (genres && Array.isArray(genres) && genres.length > 0) {
            console.log('Books API - Using user preferred genres:', genres);
            genresToSearch = genres;
          } else {
            // No genres found in the user preferences
            console.log('Books API - No genres found in user preferences, using default genres');
            genresToSearch = ['Fiction', 'Mystery', 'Science Fiction'];
          }
        }
      } catch (error) {
        // Exception in the API call
        console.error('Books API - Exception fetching preferences:', error);
        genresToSearch = ['Fiction', 'Mystery', 'Science Fiction'];
      }
    }

    // Ensure we have genres to search
    if (!genresToSearch.length) {
      console.error('No genres to search');
      return NextResponse.json(
        { error: 'Genre information not available' },
        { status: 404 }
      );
    }

    // Fetch books for each genre
    const bookPromises = genresToSearch.map(async (genreName: string) => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(
            genreName
          )}&maxResults=10&langRestrict=en&key=${apiKey}`
        );

        if (!response.ok) {
          console.error(`API error for genre ${genreName}: ${response.status} ${response.statusText}`);
          return [];
        }

        const data = await response.json();
        
        // Check if we got valid results
        if (!data.items || !Array.isArray(data.items)) {
          console.log(`No books found for genre: ${genreName}`);
          return [];
        }

        // Process books for this genre
        return data.items.map((book: any) => ({
          id: book.id,
          title: book.volumeInfo?.title || 'Unknown Title',
          authors: book.volumeInfo?.authors || ['Unknown Author'],
          description: book.volumeInfo?.description || 'No description available',
          coverImage: book.volumeInfo?.imageLinks?.thumbnail || '/default-book-cover.jpg',
          genres: [genreName, ...(book.volumeInfo?.categories || [])].slice(0, 3),
          averageRating: book.volumeInfo?.averageRating || 0,
          pageCount: book.volumeInfo?.pageCount,
          publishedDate: book.volumeInfo?.publishedDate,
          publisher: book.volumeInfo?.publisher,
          previewLink: book.volumeInfo?.previewLink,
          infoLink: book.volumeInfo?.infoLink,
          primaryGenre: genreName // Add the search genre as primary
        }));
      } catch (error) {
        console.error(`Error fetching books for genre ${genreName}:`, error);
        return [];
      }
    });

    try {
      // Wait for all API calls to complete
      const bookResults = await Promise.all(bookPromises);
      const allBooks = bookResults.flat();

      // Process and format the books
      if (allBooks.length > 0) {
        // Remove duplicates
        const uniqueBooks = Array.from(
          new Map(allBooks.map(book => [book.id, book])).values()
        );

        // Sort books to prioritize user's preferred genres
        const sortedBooks = uniqueBooks.sort((a, b) => {
          // Get primary genre indexes from user's preferences (lower index = higher priority)
          const aPrimaryGenreIndex = genresToSearch.indexOf(a.primaryGenre);
          const bPrimaryGenreIndex = genresToSearch.indexOf(b.primaryGenre);
          
          // If both books match a preferred genre
          if (aPrimaryGenreIndex >= 0 && bPrimaryGenreIndex >= 0) {
            // Sort by the genre priority first
            return aPrimaryGenreIndex - bPrimaryGenreIndex;
          }
          
          // If only one book matches a preferred genre, prioritize it
          if (aPrimaryGenreIndex >= 0) return -1;
          if (bPrimaryGenreIndex >= 0) return 1;
          
          // For books that don't match primary genres, check if they match any user genres
          const aHasUserGenre = a.genres.some((genre: string) => 
            genresToSearch.includes(genre));
          const bHasUserGenre = b.genres.some((genre: string) => 
            genresToSearch.includes(genre));
            
          if (aHasUserGenre && !bHasUserGenre) return -1;
          if (!aHasUserGenre && bHasUserGenre) return 1;
          
          // Finally, sort by rating
          return (b.averageRating || 0) - (a.averageRating || 0);
        });

        return NextResponse.json(sortedBooks);
      } else {
        console.warn('No books found from API, using sample data');
        return NextResponse.json(sampleBooks);
      }
    } catch (aggregationError) {
      console.error('Error processing book results:', aggregationError);
      return NextResponse.json(sampleBooks);
    }
  } catch (error) {
    console.error('Unexpected error in books API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 