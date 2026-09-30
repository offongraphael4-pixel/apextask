/**
 * ============================================================================
 * SUPABASE CONFIGURATION
 * ============================================================================
 * Enter your Supabase Project URL and Anon/Publishable Key below.
 * IMPORTANT: NEVER use a service-role or secret key in client-side code!
 */

export const SUPABASE_CONFIG = {
  // Your Supabase Project URL (e.g. 'https://abcdefghijklm.supabase.co')
  url: '',

  // Your Supabase Anon/Publishable API Key (starts with 'eyJ...' or 'sb_anon_...')
  anonKey: ''
};

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url.trim().length > 0 &&
    !SUPABASE_CONFIG.url.includes('YOUR_') &&
    SUPABASE_CONFIG.anonKey &&
    SUPABASE_CONFIG.anonKey.trim().length > 0 &&
    !SUPABASE_CONFIG.anonKey.includes('YOUR_')
  );
}
