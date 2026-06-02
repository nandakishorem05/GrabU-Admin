import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ibophltufhguhnuybaaj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_5R0dtc7BcnTYG5A6m_iSjA__EFlOwVs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
