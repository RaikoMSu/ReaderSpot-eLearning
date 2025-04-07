import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Import the client from the src/lib/supabase.ts file to avoid duplicate instances
import { supabase as supabaseClient } from '@/lib/supabase'

export const supabase = supabaseClient 