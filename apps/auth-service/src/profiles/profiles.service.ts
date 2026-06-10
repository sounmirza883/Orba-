import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@nexushub/nest-common';
import type { Profile, UpdateProfileRequest } from '@nexushub/shared-types';

const PUBLIC_FIELDS = 'id, username, display_name, bio, avatar_url, tier_id, created_at';

@Injectable()
export class ProfilesService {
  constructor(private readonly supabase: SupabaseService) {}

  async getMe(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*, tier:membership_tiers(id, name, price_cents, interval)')
      .eq('id', userId)
      .single();
    if (error || !data) throw new NotFoundException('Profile not found');
    return data as Profile;
  }

  async updateMe(userId: string, update: UpdateProfileRequest): Promise<Profile> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .update({
        display_name: update.displayName,
        bio: update.bio,
        avatar_url: update.avatarUrl,
      })
      .eq('id', userId)
      .select()
      .single();
    if (error || !data) throw new NotFoundException('Profile not found');
    return data as Profile;
  }

  async getByUsername(username: string): Promise<Partial<Profile>> {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select(PUBLIC_FIELDS)
      .eq('username', username)
      .eq('is_banned', false)
      .single();
    if (error || !data) throw new NotFoundException('Profile not found');
    return data as Partial<Profile>;
  }

  async list(search?: string, tierId?: string): Promise<Partial<Profile>[]> {
    let query = this.supabase.client
      .from('profiles')
      .select(`${PUBLIC_FIELDS}, is_owner, is_banned, last_seen_at`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (search) query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%`);
    if (tierId) query = query.eq('tier_id', tierId);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as Partial<Profile>[];
  }

  async ban(userId: string): Promise<void> {
    const { error } = await this.supabase.client
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId);
    if (error) throw new Error(error.message);
  }
}
