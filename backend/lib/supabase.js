let supabase = null;

try {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (url && key) {
    supabase = createClient(url, key);
    console.log('✓ Supabase connected');
  } else {
    console.warn('⚠ Supabase not configured — running in demo mode');
  }
} catch {
  console.warn('⚠ @supabase/supabase-js not installed — run: npm install @supabase/supabase-js');
}

module.exports = supabase;
