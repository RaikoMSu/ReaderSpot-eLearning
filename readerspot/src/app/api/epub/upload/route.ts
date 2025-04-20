import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Increase the body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('EPUB upload API endpoint called');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const filename = formData.get('filename') as string;

    console.log('Received upload request for:', filename, 'from user:', userId);

    if (!file || !userId) {
      console.error('Missing required fields:', { file: !!file, userId: !!userId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.epub')) {
      console.error('Invalid file type:', file.name);
      return NextResponse.json(
        { error: 'Only EPUB files are supported' },
        { status: 400 }
      );
    }

    console.log('File validation passed, creating buffer...');
    
    // Create a buffer from the file
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    console.log('Buffer created, size:', fileBuffer.length, 'bytes');

    // Initialize Supabase client
    const supabase = createClient();
    console.log('Supabase client initialized');

    // Check if the books bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('Error listing storage buckets:', bucketError);
      return NextResponse.json(
        { error: 'Failed to check storage buckets: ' + bucketError.message },
        { status: 500 }
      );
    }
    
    const booksBucketExists = buckets.some(bucket => bucket.name === 'books');
    
    if (!booksBucketExists) {
      console.error('The "books" storage bucket does not exist');
      
      // Try to create the bucket
      try {
        const { error: createBucketError } = await supabase.storage.createBucket('books', {
          public: true
        });
        
        if (createBucketError) {
          console.error('Failed to create books bucket:', createBucketError);
          return NextResponse.json(
            { error: 'Storage not configured properly. Please contact support.' },
            { status: 500 }
          );
        }
        
        console.log('Created "books" bucket successfully');
      } catch (err) {
        console.error('Error creating storage bucket:', err);
        return NextResponse.json(
          { error: 'Failed to set up storage for books. Please contact support.' },
          { status: 500 }
        );
      }
    }

    // Generate a unique file path
    const fileId = uuidv4();
    const filePath = `epubs/${userId}/${fileId}.epub`;
    console.log('Generated file path:', filePath);

    // Upload file to Supabase Storage
    console.log('Uploading file to Supabase storage...');
    const { error: uploadError } = await supabase.storage
      .from('books')
      .upload(filePath, fileBuffer, {
        contentType: 'application/epub+zip',
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage: ' + uploadError.message },
        { status: 500 }
      );
    }

    console.log('File uploaded successfully, getting public URL...');
    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('books')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Create a book entry in the database
    const bookData = {
      id: fileId,
      user_id: userId,
      title: filename.replace('.epub', ''),
      authors: ['Personal Upload'],
      cover_image: null, // We could potentially extract cover from EPUB in the future
      description: 'Personal EPUB upload',
      genre: ['Personal'],
      file_url: publicUrl,
      added_at: new Date().toISOString(),
      file_type: 'epub',
      is_user_upload: true,
    };

    // Check if user_books table exists and create it if not
    const { error: checkTableError } = await supabase
      .from('user_books')
      .select('id')
      .limit(1);

    if (checkTableError && checkTableError.message.includes('does not exist')) {
      // Create the table
      const { error: createTableError } = await supabase.rpc('create_user_books_table');
      
      if (createTableError) {
        console.error('Error creating user_books table:', createTableError);
        return NextResponse.json(
          { error: 'Failed to create user books database' },
          { status: 500 }
        );
      }
    }

    // Save book to user's collection
    const { error: saveError } = await supabase
      .from('user_books')
      .insert(bookData);

    if (saveError) {
      console.error('Error saving book to database:', saveError);
      
      // If we get a RLS policy error, try to provide more information
      if (saveError.message.includes('policy')) {
        return NextResponse.json(
          { error: 'Permission denied: Could not save to your collection' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save book to your collection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'EPUB file uploaded successfully',
      book: bookData,
    });
  } catch (error) {
    console.error('Error in EPUB upload API:', error);
    return NextResponse.json(
      { error: 'Failed to process the EPUB upload' },
      { status: 500 }
    );
  }
} 