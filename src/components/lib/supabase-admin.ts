// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

// ⚠️ This file MUST ONLY be imported in server-side code!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);