// backend/config/supabaseClient.js
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use SERVICE_ROLE key in backend only

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
