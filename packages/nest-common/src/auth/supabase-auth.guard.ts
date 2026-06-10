import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser } from '@nexushub/shared-types';
import { SupabaseService } from '../supabase/supabase.service';

export interface AuthenticatedRequest {
  headers: Record<string, string | undefined>;
  user?: AuthenticatedUser;
  accessToken?: string;
}

/**
 * Validates the Supabase JWT on every authenticated request (PRD §9).
 * Delegates entirely to Supabase Auth — no local auth logic.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const {
      data: { user },
      error,
    } = await this.supabase.client.auth.getUser(token);
    if (error || !user) throw new UnauthorizedException('Invalid or expired token');

    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('tenant_id, is_owner, is_banned')
      .eq('id', user.id)
      .single();

    if (profile?.is_banned) throw new UnauthorizedException('Account is banned');

    request.user = {
      id: user.id,
      email: user.email ?? '',
      tenantId: profile?.tenant_id ?? null,
      isOwner: profile?.is_owner ?? false,
    };
    request.accessToken = token;
    return true;
  }
}
