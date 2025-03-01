// supabaseClient.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// قراءة القيم من ملف .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// إنشاء عميل Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
