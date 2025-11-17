import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = SUPABASE_URL
const SUPABASE_ANON_KEY = SUPABASE_ANON_KEY

// Initialize the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
