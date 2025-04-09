-- Create the user_books table to store the user's downloaded books
CREATE TABLE IF NOT EXISTS public.user_books (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  cover_image TEXT,
  genres TEXT[] NOT NULL DEFAULT '{}',
  average_rating DECIMAL(3, 1),
  preview_link TEXT,
  info_link TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  current_page INTEGER DEFAULT 1,
  UNIQUE(user_id, book_id)
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to ensure clean recreation
DROP POLICY IF EXISTS "Users can view their own books" ON public.user_books;
DROP POLICY IF EXISTS "Users can insert their own books" ON public.user_books;
DROP POLICY IF EXISTS "Users can update their own books" ON public.user_books;
DROP POLICY IF EXISTS "Users can delete their own books" ON public.user_books;

-- Policy for users to only see and manage their own books
CREATE POLICY "Users can view their own books" 
  ON public.user_books 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Note: The important change is here - we're using the WITH CHECK clause correctly
-- and ensuring the policy is applied to authenticated users
CREATE POLICY "Users can insert their own books" 
  ON public.user_books 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" 
  ON public.user_books 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" 
  ON public.user_books 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Optional: Create index for faster searches
CREATE INDEX IF NOT EXISTS user_books_user_id_idx ON public.user_books (user_id);
CREATE INDEX IF NOT EXISTS user_books_book_id_idx ON public.user_books (book_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_books TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.user_books_id_seq TO authenticated; 