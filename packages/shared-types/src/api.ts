/**
 * API request/response shapes shared between gateway, services, and frontend.
 */

export interface PaginatedResult<T> {
  items: T[];
  /** Cursor (ISO timestamp) for the next page, or null when exhausted. */
  nextCursor: string | null;
}

export interface CursorPaginationQuery {
  cursor?: string;
  limit?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  tenantId: string | null;
  isOwner: boolean;
}

export interface CreatePostRequest {
  title?: string;
  /** TipTap JSON document */
  body: unknown;
}

export interface CreateCommentRequest {
  body: string;
  parentId?: string;
  mentionedIds?: string[];
}

export interface ToggleReactionRequest {
  targetType: 'post' | 'comment';
  emoji: string;
}

export interface CreateSpaceRequest {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  type?: 'discussion' | 'course' | 'events' | 'directory';
  isPrivate?: boolean;
  tierIds?: string[];
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CreateTierRequest {
  name: string;
  priceCents: number;
  interval: 'month' | 'year';
}

export interface CreateCheckoutRequest {
  tierId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  url: string;
}

export interface SignUploadRequest {
  fileName: string;
  contentType: string;
  bucket: 'avatars' | 'post-media' | 'course-files';
}

export interface SignUploadResponse {
  signedUrl: string;
  path: string;
  token: string;
}

export interface SendDmRequest {
  body: string;
}

export interface CreateDmThreadRequest {
  recipientId: string;
}

export interface CreateCourseSectionRequest {
  title: string;
  sortOrder?: number;
}

export interface CreateCourseLessonRequest {
  sectionId: string;
  title: string;
  type: 'text' | 'video' | 'download';
  content?: unknown;
  sortOrder?: number;
}

export interface CourseOutline {
  spaceId: string;
  sections: {
    id: string;
    title: string;
    sort_order: number;
    lessons: {
      id: string;
      title: string;
      type: 'text' | 'video' | 'download';
      content: unknown;
      sort_order: number;
    }[];
  }[];
}

export interface CourseProgress {
  completedLessonIds: string[];
  totalLessons: number;
  percentComplete: number;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  locationUrl?: string;
  rsvpLimit?: number;
}

export interface EventWithRsvps {
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
  rsvp_count: number;
  user_has_rsvped: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  emailReplies?: boolean;
  emailMentions?: boolean;
  emailNewPosts?: boolean;
  weeklyDigest?: boolean;
}
