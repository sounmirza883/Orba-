import { createBrowserClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Fetch wrapper for the NexusHub API Gateway — attaches the Supabase JWT. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
