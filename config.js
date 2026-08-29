// Fill these in from Supabase: Project Settings → API
// SUPABASE_URL looks like: https://xxxxxxxxxxxx.supabase.co
// SUPABASE_ANON_KEY is the long "anon / public" key (safe to expose in a
// static site — it only grants what your Row Level Security policies allow)

const SUPABASE_URL = "https://ptbitooljfrtuydnoydt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_AWbyRrawR0cyciR_-cTnTg_TOlau7Ow";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);