import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Fetching preferences for user ID:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user preferences from the correct table using maybeSingle
    console.log('Querying user_preferences table for user_id:', userId);
    
    const { data: userPreferences, error: queryError } = await supabase
      .from('user_preferences')
      .select('*')  // Select all columns to see what's available
      .eq('user_id', userId)
      .maybeSingle();  // Use maybeSingle() to prevent PGRST116 errors

    console.log('Full preferences data:', userPreferences);

    if (queryError) {
      // Real database error (not just missing rows)
      console.error('Error fetching user preferences (database error):', queryError);
      return NextResponse.json(
        { error: 'Database error when fetching user preferences' },
        { status: 500 }
      );
    }
    
    if (!userPreferences) {
      // No preferences found for this user
      console.log('No preferences found for user, returning default genres');
      return NextResponse.json({
        preferred_genres: ['Fiction', 'Fantasy', 'Mystery']
      });
    }
    
    // Check different possible field names
    const genres = userPreferences.preferred_genres || 
                   userPreferences.preferredGenres || 
                   userPreferences.preferred_genre ||
                   userPreferences.genre_preferences;
    
    if (genres && Array.isArray(genres) && genres.length > 0) {
      console.log('Found user preferred genres:', genres);
      
      // Return the complete userPreferences but ensure preferred_genres is set correctly
      return NextResponse.json({
        ...userPreferences,
        preferred_genres: genres
      });
    } else {
      // No genres found in user preferences
      console.log('No genres found in user preferences, using default genres');
      return NextResponse.json({
        ...userPreferences,
        preferred_genres: ['Fiction', 'Fantasy', 'Mystery']
      });
    }
  } catch (error) {
    console.error('Error in user preferences API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 