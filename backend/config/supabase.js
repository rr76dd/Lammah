const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// جلب القيم من ملف البيئة .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ خطأ: يجب تحديد SUPABASE_URL و SUPABASE_KEY في ملف .env");
  process.exit(1); // إنهاء التطبيق في حالة وجود خطأ
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
