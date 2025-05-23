// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://vyilkatitgmoyaqexkay.supabase.co!;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aWxrYXRpdGdtb3lhcWV4a2F5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5ODYwNDgsImV4cCI6MjA2MzU2MjA0OH0.B6KDgQYuf_DRTGp-udTojUfSOEm4hnCayRr1QIFYz-E!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);