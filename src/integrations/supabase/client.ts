// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wyqncdsniwajivzyktlr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cW5jZHNuaXdhaml2enlrdGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3NjM3NjAsImV4cCI6MjA1ODMzOTc2MH0.Hh_lY3WG8qqF9ygpFPVf5yAEDMzyk5uyyFvKZStafGc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);