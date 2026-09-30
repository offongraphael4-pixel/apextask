/**
 * ============================================================================
 * SUPABASE CONFIGURATION
 * ============================================================================
 * Project: offongraphael4-pixel's Project (htmcmaxzcfnejxjfvhnj)
 * Safe for client-side use: Only the public anon key is included.
 */

export const SUPABASE_CONFIG = {
  url: 'https://htmcmaxzcfnejxjfvhnj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bWNtYXh6Y2ZuZWp4amZ2aG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NzM5MzYsImV4cCI6MjEwNjM0OTkzNn0.j1oWZan9hnPiji9FgHU3m0M4hRHHOi8o0i-8xYXEfD8'
};

export function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url &&
    SUPABASE_CONFIG.url.trim().length > 0 &&
    SUPABASE_CONFIG.anonKey &&
    SUPABASE_CONFIG.anonKey.trim().length > 0
  );
}
