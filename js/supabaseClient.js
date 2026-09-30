/**
 * ============================================================================
 * SUPABASE AUTHENTICATION CLIENT
 * Handles email/password sign-up, sign-in, session recovery & state sync
 * ============================================================================
 */

import { SUPABASE_CONFIG, isSupabaseConfigured } from './supabaseConfig.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

let supabaseClient = null;

// Initialize Supabase Client safely using Anon Key
export function getSupabase() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    // Safety check: ensure service role key is NEVER passed to the client
    if (SUPABASE_CONFIG.anonKey.toLowerCase().includes('service_role')) {
      console.error('[SECURITY ERROR] Service role key detected! Only the anon/publishable key may be used in frontend code.');
      throw new Error('SECURITY VIOLATION: Service role key cannot be used in frontend. Use anon key.');
    }

    supabaseClient = createClient(SUPABASE_CONFIG.url.trim(), SUPABASE_CONFIG.anonKey.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return supabaseClient;
}

/**
 * Sign up a new user with Email, Password and metadata
 */
export async function signUpUser({ email, password, fullName, phone, role = 'worker' }) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Please provide your Project URL and Anon Key.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: role,
        app_name: 'ApexTask'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user with Email and Password
 */
export async function signInUser({ email, password }) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Please provide your Project URL and Anon Key.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  const supabase = getSupabase();
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
}

/**
 * Get active session
 */
export async function getCurrentSession() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (err) {
    console.warn('[Supabase Auth] Session fetch error:', err);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return () => {
    subscription?.unsubscribe();
  };
}
