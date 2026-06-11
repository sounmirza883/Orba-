/**
 * NATS message patterns and event payloads (PRD §9 — Service Contracts).
 *
 * Every inter-service event published on the NATS bus is keyed and typed here.
 * Services import these to keep publisher/subscriber contracts in sync.
 */

export interface UserCreatedEvent {
  userId: string;
  tenantId: string;
  email: string;
}

export interface UserBannedEvent {
  userId: string;
  tenantId: string;
}

export interface PostCreatedEvent {
  postId: string;
  spaceId: string;
  authorId: string;
  tenantId: string;
}

export interface CommentCreatedEvent {
  commentId: string;
  postId: string;
  postAuthorId: string;
  authorId: string;
  mentionedIds: string[];
}

export interface SubscriptionActivatedEvent {
  userId: string;
  tierId: string;
  stripeSubId: string;
}

export interface SubscriptionCancelledEvent {
  userId: string;
  tierId: string;
}

export interface UploadCompletedEvent {
  fileUrl: string;
  bucket: string;
  userId: string;
}

export interface ServiceEvents {
  // Auth Service publishes
  'user.created': UserCreatedEvent;
  'user.banned': UserBannedEvent;

  // Community Service publishes
  'post.created': PostCreatedEvent;
  'comment.created': CommentCreatedEvent;

  // Membership Service publishes
  'subscription.activated': SubscriptionActivatedEvent;
  'subscription.cancelled': SubscriptionCancelledEvent;

  // Media Service publishes
  'upload.completed': UploadCompletedEvent;
}

export type ServiceEventName = keyof ServiceEvents;

/** NATS subjects used for request/reply message patterns through the Gateway. */
export const MessagePatterns = {
  // auth-service
  PROFILE_GET_ME: 'auth.profile.getMe',
  PROFILE_UPDATE_ME: 'auth.profile.updateMe',
  PROFILE_GET_BY_USERNAME: 'auth.profile.getByUsername',
  PROFILE_LIST: 'auth.profile.list',
  PROFILE_BAN: 'auth.profile.ban',

  // community-service
  SPACES_LIST: 'community.spaces.list',
  SPACES_CREATE: 'community.spaces.create',
  SPACES_UPDATE: 'community.spaces.update',
  SPACES_DELETE: 'community.spaces.delete',
  POSTS_LIST: 'community.posts.list',
  POSTS_GET: 'community.posts.get',
  POSTS_CREATE: 'community.posts.create',
  POSTS_UPDATE: 'community.posts.update',
  POSTS_DELETE: 'community.posts.delete',
  POSTS_SEARCH: 'community.posts.search',
  COMMENTS_CREATE: 'community.comments.create',
  COMMENTS_LIST: 'community.comments.list',
  REACTIONS_TOGGLE: 'community.reactions.toggle',

  // community-service: courses
  COURSE_GET: 'community.courses.get',
  COURSE_SECTION_CREATE: 'community.courses.sections.create',
  COURSE_LESSON_CREATE: 'community.courses.lessons.create',
  COURSE_LESSON_COMPLETE: 'community.courses.lessons.complete',
  COURSE_PROGRESS_GET: 'community.courses.progress.get',

  // community-service: events
  EVENTS_LIST: 'community.events.list',
  EVENTS_CREATE: 'community.events.create',
  EVENTS_RSVP: 'community.events.rsvp',
  EVENTS_RSVP_CANCEL: 'community.events.rsvpCancel',

  // chat-service
  DM_THREADS_LIST: 'chat.threads.list',
  DM_THREAD_CREATE: 'chat.threads.create',
  DM_MESSAGES_LIST: 'chat.messages.list',
  DM_MESSAGE_SEND: 'chat.messages.send',

  // membership-service
  TIERS_LIST: 'membership.tiers.list',
  TIERS_CREATE: 'membership.tiers.create',
  CHECKOUT_CREATE: 'membership.checkout.create',
  BILLING_PORTAL: 'membership.billing.portal',

  // media-service
  UPLOAD_SIGN: 'media.uploads.sign',

  // notification-service
  NOTIFICATIONS_LIST: 'notifications.list',
  NOTIFICATIONS_MARK_READ: 'notifications.markRead',
  NOTIFICATIONS_PREFS_GET: 'notifications.prefs.get',
  NOTIFICATIONS_PREFS_UPDATE: 'notifications.prefs.update',
} as const;

export type MessagePattern = (typeof MessagePatterns)[keyof typeof MessagePatterns];
