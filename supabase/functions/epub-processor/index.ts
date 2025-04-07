// @deno-types="https://deno.land/x/servest@v1.3.1/types/react/index.d.ts"
// The above line might help some tools, but imports below are standard for Supabase Edge Functions

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts' // Deno standard library for HTTP server
import { createClient } from 'npm:@supabase/supabase-js@2' // Deno specific npm module import
import EpubParser from 'npm:epub-parser@1.0.3' // Deno specific npm module import
import 'npm:isomorphic-fetch' // Polyfill for supabase-js in Deno

// Define simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Be specific in production!
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log('epub-processor function initializing...')

serve(async (req: Request) => { // Added type hint for req
  console.log(`Request received: ${req.method} ${req.url}`)

  // --- CORS Preflight Handling ---
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Input Validation ---
    if (!req.body) {
        return new Response(JSON.stringify({ error: 'Request body is required.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
    const { filePath, bookId, uploaderId } = await req.json()
    console.log('Received parameters:', { filePath, bookId, uploaderId })

    if (!filePath || !bookId || !uploaderId) {
        const missingParams = [
            !filePath && 'filePath',
            !bookId && 'bookId',
            !uploaderId && 'uploaderId'
        ].filter(Boolean).join(', ');
      throw new Error(`Missing required parameters: ${missingParams}`)
    }

    // --- Supabase Admin Client Initialization ---
    // Deno.env.get is the standard way to access env vars in Deno/Supabase Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
      throw new Error('Server configuration error: Missing Supabase credentials.')
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
       auth: { persistSession: false, autoRefreshToken: false }
    })
    console.log('Supabase admin client created.')


    // --- Download EPUB from Storage ---
    console.log(`Downloading file from storage bucket 'books' at path: ${filePath}`)
    const { data: blobData, error: downloadError } = await supabaseAdmin
      .storage
      .from('books')
      .download(filePath)

    if (downloadError) {
      console.error(`Storage download error for path ${filePath}:`, downloadError)
      throw new Error(`Storage download error: ${downloadError.message}`)
    }
    if (!blobData) {
      console.error(`No data returned from storage download for path ${filePath}.`)
      throw new Error('Downloaded file data is null or empty.')
    }
    console.log(`File downloaded successfully (${(blobData.size / 1024).toFixed(2)} KB)`)


    // --- Parse EPUB ---
    const arrayBuffer = await blobData.arrayBuffer()
    console.log('Parsing EPUB...')
    const parser = new EpubParser(arrayBuffer)
    const parsedData = await parser.parse()

    if (!parsedData) {
        console.error('epub-parser returned null or undefined.')
        throw new Error('EPUB parsing failed or returned no data.')
    }
    console.log('EPUB parsed successfully.')

    // --- Extract Metadata ---
    const metadata = parsedData.metadata || {}
    const title = metadata.title || 'Untitled Book'
    const creator = metadata.creator
    // Handle creator potentially being an array or string
    const author = Array.isArray(creator) ? creator.join(', ') : (creator || 'Unknown Author')
    console.log(`Extracted Metadata - Title: ${title}, Author: ${author}`)


    // --- Update Book Metadata in Database ---
    console.log(`Updating book record in 'books' table with ID: ${bookId}`)
    const { error: updateBookError } = await supabaseAdmin
      .from('books')
      .update({
        title: title,
        author: author,
        processed: true,
        processed_at: new Date().toISOString(),
        metadata: metadata, // Store raw metadata
      })
      .eq('id', bookId)

    if (updateBookError) {
      console.error(`DB book update error for book ID ${bookId}:`, updateBookError)
      throw new Error(`DB book update error: ${updateBookError.message}`)
    }
    console.log(`Book record updated successfully for: ${title}`)


    // --- Extract and Save Chapters ---
    console.log('Extracting and preparing chapters for database insertion...')
    // Define type for chapter data matching DB schema
    type ChapterInsert = { book_id: string; chapter_order: number; title?: string; content?: string };
    const chaptersToInsert: ChapterInsert[] = [];
    let chapterOrder = 1;

    // **ADAPT THIS SECTION based on epub-parser v1.x output**
    if (parsedData.sections && Array.isArray(parsedData.sections)) {
        for (const section of parsedData.sections) {
            const chapterTitle = section.label || section.title || section.id || `Chapter ${chapterOrder}`;
            let chapterContent = '';

            try {
                if (typeof section.loadContent === 'function') {
                    chapterContent = await section.loadContent();
                    console.log(`Loaded content for chapter ${chapterOrder} (Title: ${chapterTitle.substring(0,30)}...) - Length: ${chapterContent?.length || 0}`)
                } else if (section.html) {
                     chapterContent = section.html;
                     console.log(`Using pre-loaded HTML content for chapter ${chapterOrder} (Title: ${chapterTitle.substring(0,30)}...) - Length: ${chapterContent?.length || 0}`)
                } else if (section.content) {
                    chapterContent = section.content;
                    console.log(`Using fallback 'content' for chapter ${chapterOrder} (Title: ${chapterTitle.substring(0,30)}...) - Length: ${chapterContent?.length || 0}`)
                }
                 else {
                    console.warn(`Could not find loadable content method or property for section: ${chapterTitle}`);
                    chapterContent = '<p>Content extraction failed for this section.</p>';
                }
            } catch (contentError) {
                console.error(`Error loading content for chapter ${chapterOrder} (Title: ${chapterTitle}):`, contentError);
                chapterContent = `<p>Error loading chapter content: ${contentError.message}</p>`;
            }

            // Skip potentially empty chapters
            if (!chapterContent || chapterContent.length < 50) { // Adjust threshold as needed
                console.log(`Skipping potentially empty or placeholder chapter ${chapterOrder} (Title: ${chapterTitle})`);
                continue;
            }

            chaptersToInsert.push({
                book_id: bookId,
                chapter_order: chapterOrder++,
                title: chapterTitle,
                content: chapterContent,
            });
        }
    } else {
         console.warn("Could not find 'sections' array in parsed EPUB data.");
    }


    // --- Insert Chapters into Database ---
    if (chaptersToInsert.length > 0) {
      console.log(`Attempting to insert ${chaptersToInsert.length} chapters into 'chapters' table for book ID ${bookId}...`);
      const { error: insertChaptersError } = await supabaseAdmin
        .from('chapters')
        .insert(chaptersToInsert)

      if (insertChaptersError) {
        console.error(`DB chapters insert error for book ID ${bookId}:`, insertChaptersError)
        throw new Error(`DB chapters insert error: ${insertChaptersError.message}`)
      }
      console.log(`${chaptersToInsert.length} chapters inserted successfully.`);
    } else {
       console.log("No valid chapters found or extracted to insert.");
    }

    // --- Return Success Response ---
    console.log(`Processing completed successfully for book ID: ${bookId}`)
    return new Response(JSON.stringify({ message: `Successfully processed: ${title}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    // --- Error Handling ---
    console.error('Error processing EPUB in Edge Function:', error)
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred during processing.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

console.log('epub-processor function initialized and waiting for requests.') 