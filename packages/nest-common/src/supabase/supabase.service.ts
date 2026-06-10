import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase access for all microservices.
 * Uses the service-role key — server-side only, never exposed to the frontend.
 */
@Injectable()
export class SupabaseService {
  readonly client: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    this.client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /**
   * Client scoped to a user's JWT — queries run under RLS as that user.
   */
  forUser(accessToken: string): SupabaseClient {
    const url = process.env.SUPABASE_URL as string;
    const anonKey = process.env.SUPABASE_ANON_KEY ?? (process.env.SUPABASE_SERVICE_ROLE_KEY as string);
    return createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
}
