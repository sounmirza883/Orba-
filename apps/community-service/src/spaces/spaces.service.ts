import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@nexushub/nest-common';
import type { AuthenticatedUser, CreateSpaceRequest, Space } from '@nexushub/shared-types';

@Injectable()
export class SpacesService {
  constructor(private readonly supabase: SupabaseService) {}

  /** Spaces visible to the user: open spaces, or private ones matching their tier (owner sees all). */
  async listForUser(user: AuthenticatedUser): Promise<Space[]> {
    if (user.isOwner) {
      const { data, error } = await this.supabase.client
        .from('spaces')
        .select('*')
        .order('sort_order');
      if (error) throw new Error(error.message);
      return (data ?? []) as Space[];
    }

    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('tier_id')
      .eq('id', user.id)
      .single();

    const { data: accessRows } = await this.supabase.client
      .from('space_tier_access')
      .select('space_id')
      .eq('tier_id', profile?.tier_id ?? '00000000-0000-0000-0000-000000000000');

    const accessibleIds = (accessRows ?? []).map((r) => r.space_id as string);

    let query = this.supabase.client.from('spaces').select('*').order('sort_order');
    query =
      accessibleIds.length > 0
        ? query.or(`is_private.eq.false,id.in.(${accessibleIds.join(',')})`)
        : query.eq('is_private', false);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Space[];
  }

  async getBySlug(slug: string, user: AuthenticatedUser): Promise<Space> {
    const { data, error } = await this.supabase.client
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error || !data) throw new NotFoundException('Space not found');

    const space = data as Space;
    if (space.is_private && !user.isOwner) {
      const hasAccess = await this.userHasTierAccess(user.id, space.id);
      if (!hasAccess) throw new ForbiddenException('No access to this space');
    }
    return space;
  }

  async create(user: AuthenticatedUser, request: CreateSpaceRequest): Promise<Space> {
    const { data, error } = await this.supabase.client
      .from('spaces')
      .insert({
        tenant_id: user.tenantId,
        name: request.name,
        slug: request.slug,
        description: request.description,
        icon: request.icon ?? '💬',
        type: request.type ?? 'discussion',
        is_private: request.isPrivate ?? false,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create space');

    const space = data as Space;
    if (request.tierIds?.length) {
      await this.supabase.client
        .from('space_tier_access')
        .insert(request.tierIds.map((tierId) => ({ space_id: space.id, tier_id: tierId })));
    }
    return space;
  }

  async update(spaceId: string, patch: Partial<CreateSpaceRequest>): Promise<Space> {
    const { data, error } = await this.supabase.client
      .from('spaces')
      .update({
        name: patch.name,
        description: patch.description,
        icon: patch.icon,
        is_private: patch.isPrivate,
      })
      .eq('id', spaceId)
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Space not found');
    return data as Space;
  }

  async delete(spaceId: string): Promise<void> {
    const { error } = await this.supabase.client.from('spaces').delete().eq('id', spaceId);
    if (error) throw new Error(error.message);
  }

  async userHasTierAccess(userId: string, spaceId: string): Promise<boolean> {
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('tier_id, is_owner')
      .eq('id', userId)
      .single();
    if (profile?.is_owner) return true;
    if (!profile?.tier_id) return false;

    const { data } = await this.supabase.client
      .from('space_tier_access')
      .select('space_id')
      .eq('space_id', spaceId)
      .eq('tier_id', profile.tier_id)
      .maybeSingle();
    return data != null;
  }
}
