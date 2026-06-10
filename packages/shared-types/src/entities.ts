/**
 * Database entity types mirroring the Supabase schema (PRD §8).
 */

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  accent_color: string;
  created_at: string;
}

export type TierInterval = 'month' | 'year';

export interface MembershipTier {
  id: string;
  tenant_id: string;
  name: string;
  price_cents: number;
  interval: TierInterval;
  stripe_price_id: string | null;
  is_free: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string | null;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  tier_id: string | null;
  stripe_customer_id: string | null;
  is_owner: boolean;
  is_banned: boolean;
  last_seen_at: string;
  created_at: string;
}

export type SpaceType = 'discussion' | 'course' | 'events' | 'directory';

export interface Space {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  type: SpaceType;
  is_private: boolean;
  sort_order: number;
  created_at: string;
}

export interface Post {
  id: string;
  space_id: string;
  author_id: string | null;
  title: string | null;
  /** TipTap JSON document, stored as JSONB */
  body: unknown;
  is_pinned: boolean;
  is_hidden: boolean;
  comment_count: number;
  reaction_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_id: string | null;
  body: string;
  is_hidden: boolean;
  created_at: string;
}

export type ReactionTargetType = 'post' | 'comment';

export interface Reaction {
  id: string;
  target_id: string;
  target_type: ReactionTargetType;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface DmThread {
  id: string;
  tenant_id: string | null;
  created_at: string;
}

export interface DmMessage {
  id: string;
  thread_id: string;
  sender_id: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface CourseSection {
  id: string;
  space_id: string;
  title: string;
  sort_order: number;
}

export type LessonType = 'text' | 'video' | 'download';

export interface CourseLesson {
  id: string;
  section_id: string;
  title: string;
  type: LessonType;
  content: unknown;
  sort_order: number;
}

export interface LessonProgress {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

export interface CommunityEvent {
  id: string;
  space_id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location_url: string | null;
  rsvp_limit: number | null;
  created_by: string | null;
  created_at: string;
}

export type NotificationType = 'mention' | 'reply' | 'new_post' | 'reaction';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  actor_id: string | null;
  target_id: string | null;
  target_type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface MemberPoints {
  user_id: string;
  total_points: number;
  updated_at: string;
}
