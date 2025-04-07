-- Add missing columns to the books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS total_chapters INTEGER,
ADD COLUMN IF NOT EXISTS processing_error BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add missing columns to the chapters table
ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS href VARCHAR(255),
ADD COLUMN IF NOT EXISTS chapter_order INTEGER;

-- Recreate policies to ensure correct access
DROP POLICY IF EXISTS "Uploaders can modify their books" ON books;
CREATE POLICY "Uploaders can modify their books" ON books
  FOR ALL USING (auth.uid() = uploader_id);

DROP POLICY IF EXISTS "Authenticated users can insert books" ON books;
CREATE POLICY "Authenticated users can insert books" ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

-- Ensure storage access is correct
DROP POLICY IF EXISTS "Anyone can download books" ON storage.objects;
CREATE POLICY "Anyone can download books" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'books'); 