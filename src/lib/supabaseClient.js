import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zsabnxnlwklkfogvbxbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzYWJueG5sd2tsa2ZvZ3ZieGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTg2OTUsImV4cCI6MjA3ODQzNDY5NX0.OZlVo5FQB0SKxgBMQgITo1y3tYJ1Yn-Bjgu1DVvtRVU';

// Initialize the client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);