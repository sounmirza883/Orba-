import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from './supabase-auth.guard';

/** Restricts a route to the community owner. Use after SupabaseAuthGuard. */
@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user?.isOwner) {
      throw new ForbiddenException('Owner access required');
    }
    return true;
  }
}
