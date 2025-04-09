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

    // Fetch user preferences
    console.log('Querying user_preferences table for user_id:', userId);
    
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Query result:', { preferences, error });

    if (error) {
      console.error('Error fetching user preferences:', error);
      
      // If the error is that no row was found, return empty preferences
      if (error.code === 'PGRST116') {
        console.log('No preferences found, using default genres');
        
        // Try fetching from user_profiles to see if we can find preferences there
        console.log('Checking user_profiles table as fallback');
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('preferred_genres')
            .eq('user_id', userId)
            .single();
            
          console.log('User profile data:', profile);
          
          if (profile?.preferred_genres && Array.isArray(profile.preferred_genres)) {
            console.log('Found genres in user_profiles:', profile.preferred_genres);
            return NextResponse.json({
              preferred_genres: profile.preferred_genres
            });
          }
        } catch (profileError) {
          console.error('Error checking user_profiles:', profileError);
        }
        
        // Fall back to defaults if nothing found
        return NextResponse.json({
          preferred_genres: ['Fiction', 'Fantasy', 'Mystery']
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch user preferences' },
        { status: 500 }
      );
    }

    console.log('Successfully found preferences:', preferences);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error in user preferences API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 