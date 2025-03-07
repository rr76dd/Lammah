import { createClient } from "@supabase/supabase-js";

/* ✅ جلب متغيرات البيئة من `.env.local` */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/* ✅ إنشاء عميل `Supabase` */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
