# ReaderSpot - E-Learning Platform

A Next.js-based e-learning platform focused on reading, personalized book recommendations, and user library management.

## Features

- User authentication with Supabase
- Personalized onboarding process
- Book recommendations based on user preferences
- Personal book library
- User profile management
- Book download and reading functionality

## Tech Stack

- Next.js 14
- React
- TypeScript
- Supabase (Auth, Database, Storage)
- Google Books API
- Tailwind CSS

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Books API key

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd readerspot
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase and Google Books API credentials

4. Set up Supabase
   - Create a new Supabase project
   - Run the SQL scripts in `/sql` directory to create the necessary tables
   - Set up storage buckets for avatars and books

5. Start the development server
   ```
   npm run dev
   ```

### Database Setup

The application requires the following tables in Supabase:

- `user_profiles` - Stores user profile information
- `user_preferences` - Stores user preferences including preferred genres
- `user_books` - Stores books in the user's personal library

The SQL scripts to create these tables are available in the `/sql` directory.

## License

[MIT](LICENSE)
