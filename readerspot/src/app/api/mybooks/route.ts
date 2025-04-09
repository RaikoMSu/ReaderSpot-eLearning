import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get all books saved by a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user's saved books
    const { data: books, error } = await supabase
      .from('user_books')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching user books:', error);
      return NextResponse.json(
        { error: 'Failed to fetch your books' },
        { status: 500 }
      );
    }

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error in my books API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Save a book to user's collection
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { userId, book } = data;

    console.log('POST /api/mybooks - Request received:', { userId, bookId: book?.id });

    if (!userId || !book || !book.id) {
      console.log('POST /api/mybooks - Invalid request:', { userId, book });
      return NextResponse.json(
        { error: 'User ID and valid book information are required' },
        { status: 400 }
      );
    }

    // First, check if the user_books table exists
    try {
      const { error: tableCheckError } = await supabase
        .from('user_books')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        console.error('POST /api/mybooks - Table check error:', tableCheckError);
        return NextResponse.json(
          { 
            error: 'Database table not found', 
            details: 'The user_books table may not exist in the database. Please run the SQL script to create it.',
            code: tableCheckError.code
          },
          { status: 500 }
        );
      }
    } catch (tableError) {
      console.error('POST /api/mybooks - Table check exception:', tableError);
      return NextResponse.json(
        { 
          error: 'Database connection error', 
          details: String(tableError)
        },
        { status: 500 }
      );
    }

    // Check if book already exists in user's collection
    console.log('POST /api/mybooks - Checking if book exists:', { userId, bookId: book.id });
    const { data: existingBook, error: checkError } = await supabase
      .from('user_books')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', book.id)
      .single();

    if (checkError) {
      console.log('POST /api/mybooks - Error checking existing book:', checkError);
      if (checkError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to check if book exists in your collection', details: checkError },
          { status: 500 }
        );
      }
    }

    // If book already exists, return success with a message
    if (existingBook) {
      console.log('POST /api/mybooks - Book already exists:', existingBook);
      return NextResponse.json({
        success: true,
        message: 'Book already in your collection',
        isNewAddition: false
      });
    }

    // Insert book into user's collection
    console.log('POST /api/mybooks - Inserting new book:', { userId, bookId: book.id, book });
    
    // Ensure all required fields are present and properly formatted
    const bookData = {
      user_id: userId,
      book_id: book.id,
      title: book.title || 'Untitled Book',
      authors: Array.isArray(book.authors) ? book.authors : [],
      description: book.description || '',
      cover_image: book.coverImage || '',
      genres: Array.isArray(book.genres) ? book.genres : [],
      average_rating: typeof book.averageRating === 'number' ? book.averageRating : 0,
      preview_link: book.previewLink || null,
      info_link: book.infoLink || null,
      added_at: new Date().toISOString()
    };
    
    console.log('POST /api/mybooks - Prepared book data for insertion:', bookData);
    
    const { error: insertError } = await supabase
      .from('user_books')
      .insert(bookData);

    if (insertError) {
      console.error('POST /api/mybooks - Error saving book:', insertError);
      
      // Special handling for RLS errors
      if (insertError.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Row-level security policy violation', 
            details: 'The user does not have permission to insert into the user_books table. This is likely due to an RLS policy issue.',
            code: insertError.code,
            hint: 'Run the updated SQL script in readerspot/sql/user_books_table.sql to fix the RLS policies.',
            originalError: insertError
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to save book to your collection', 
          details: insertError,
          code: insertError.code,
          hint: insertError.hint
        },
        { status: 500 }
      );
    }

    console.log('POST /api/mybooks - Book saved successfully');
    return NextResponse.json({
      success: true,
      message: 'Book added to your collection',
      isNewAddition: true
    });
  } catch (error) {
    console.error('POST /api/mybooks - Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred', 
        details: String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Remove a book from user's collection
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');

    if (!userId || !bookId) {
      return NextResponse.json(
        { error: 'User ID and Book ID are required' },
        { status: 400 }
      );
    }

    // Delete book from user's collection
    const { error } = await supabase
      .from('user_books')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);

    if (error) {
      console.error('Error removing book:', error);
      return NextResponse.json(
        { error: 'Failed to remove book from your collection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Book removed from your collection'
    });
  } catch (error) {
    console.error('Error in remove book API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 