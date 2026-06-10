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
