// app/lib/supabaseClient.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

// Create the client once and reuse it everywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Support BOTH import styles:
//   import supabase from "../lib/supabaseClient";
//   import { supabase } from "../lib/supabaseClient";
export default supabase;
