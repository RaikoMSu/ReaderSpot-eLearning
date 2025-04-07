import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Implement singleton pattern for the Supabase client
let supabaseInstance = null;

function getSupabaseClient() {
  if (supabaseInstance === null) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'readerspot-auth'
      }
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabaseClient(); 