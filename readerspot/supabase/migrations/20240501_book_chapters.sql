-- Add new columns to the books table
ALTER TABLE books
ADD COLUMN IF NOT EXISTS uploader_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS toc_json JSONB,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(10),
ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS processing_error BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS total_chapters INTEGER,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create chapters table for storing book content
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  href VARCHAR(255),
  chapter_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on book_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);

-- Create index on order_index for sorted retrieval
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(book_id, order_index);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Create policies for chapters
CREATE POLICY "Anyone can read chapters" ON chapters
  FOR SELECT USING (true);

-- Create policy for book uploaders
CREATE POLICY "Uploaders can modify their books" ON books
  FOR ALL USING (auth.uid() = uploader_id);

-- Create policy for inserting new books
CREATE POLICY "Authenticated users can insert books" ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at on chapters
CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 