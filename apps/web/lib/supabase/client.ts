import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

// Placeholder fallbacks let `next build` prerender pages without env vars
// (CI); real values are required at runtime.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

export function createBrowserClient() {
  return createSupabaseBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
