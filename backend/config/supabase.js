const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); 

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Supabase URL and Key are required!");
    process.exit(1);  // بدلاً من throw new Error()
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
