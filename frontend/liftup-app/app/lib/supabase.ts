import { createClient } from "@supabase/supabase-js";

import { CONFIG } from "./config";

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

export const supabase = createClient(
  SUPABASE_URL as string,
  SUPABASE_ANON_KEY as string
);
