-- Create books storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'books',
  'books',
  true,
  52428800, -- 50MB
  '{application/pdf,application/epub+zip,application/x-mobipocket-ebook}'
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = '{application/pdf,application/epub+zip,application/x-mobipocket-ebook}';

-- Set up storage policies
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload books" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'books' AND
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );

-- Allow anyone to read public books
CREATE POLICY "Anyone can download books" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'books');

-- Allow users to update and delete their own books
CREATE POLICY "Users can update their books" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'books' AND
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  );

CREATE POLICY "Users can delete their books" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'books' AND
    auth.uid()::text = SPLIT_PART(name, '/', 1)
  ); 