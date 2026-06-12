'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AppNotification,
  Comment,
  CourseOutline,
  CourseProgress,
  EventWithRsvps,
  MembershipTier,
  PaginatedResult,
  Post,
  Profile,
  Space,
  UpdateNotificationPreferencesRequest,
} from '@nexushub/shared-types';
import { apiFetch } from './client';

export const useMyProfile = () =>
  useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => apiFetch<Profile>('/profiles/me'),
  });

export const useSpaces = () =>
  useQuery({
    queryKey: ['spaces'],
    queryFn: () => apiFetch<Space[]>('/spaces'),
  });

export const useSpacePosts = (spaceSlug: string) =>
  useInfiniteQuery({
    queryKey: ['posts', spaceSlug],
    queryFn: ({ pageParam }) =>
      apiFetch<PaginatedResult<Post>>(
        `/spaces/${spaceSlug}/posts${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 1000 * 30, // 30s fresh — Realtime handles live updates
  });

export const useCreatePost = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { title?: string; body: unknown }) =>
      apiFetch<Post>(`/spaces/${spaceSlug}/posts`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', spaceSlug] }),
  });
};

export const usePostComments = (postId: string) =>
  useQuery({
    queryKey: ['comments', postId],
    queryFn: () => apiFetch<Comment[]>(`/posts/${postId}/comments`),
  });

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; parentId?: string }) =>
      apiFetch<Comment>(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', postId] }),
  });
};

export const useToggleReaction = () =>
  useMutation({
    mutationFn: (input: { targetId: string; targetType: 'post' | 'comment'; emoji: string }) =>
      apiFetch<{ reacted: boolean }>(`/posts/${input.targetId}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ targetType: input.targetType, emoji: input.emoji }),
      }),
  });

export const useTiers = () =>
  useQuery({
    queryKey: ['tiers'],
    queryFn: () => apiFetch<MembershipTier[]>('/tiers'),
  });

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch<AppNotification[]>('/notifications'),
    refetchInterval: 60_000,
  });

export const useCourse = (spaceSlug: string) =>
  useQuery({
    queryKey: ['course', spaceSlug],
    queryFn: () => apiFetch<CourseOutline>(`/courses/${spaceSlug}`),
  });

export const useCourseProgress = (spaceSlug: string) =>
  useQuery({
    queryKey: ['course-progress', spaceSlug],
    queryFn: () => apiFetch<CourseProgress>(`/courses/${spaceSlug}/progress`),
  });

export const useCompleteLesson = (spaceSlug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) =>
      apiFetch<{ ok: boolean }>(`/courses/lessons/${lessonId}/complete`, { method: 'POST' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['course-progress', spaceSlug] }),
  });
};

export const useSpaceEvents = (spaceSlug: string | null) =>
  useQuery({
    queryKey: ['events', spaceSlug],
    queryFn: () => apiFetch<EventWithRsvps[]>(`/events/${spaceSlug}`),
    enabled: !!spaceSlug,
  });

export const useRsvp = (spaceSlug: string | null) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventId: string; cancel: boolean }) =>
      apiFetch<{ ok: boolean }>(`/events/${input.eventId}/rsvp`, {
        method: input.cancel ? 'DELETE' : 'POST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', spaceSlug] }),
  });
};

export const useNotificationPrefs = () =>
  useQuery({
    queryKey: ['notification-prefs'],
    queryFn: () =>
      apiFetch<{
        email_replies: boolean;
        email_mentions: boolean;
        email_new_posts: boolean;
        weekly_digest: boolean;
      }>('/notifications/preferences'),
  });

export const useUpdateNotificationPrefs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefs: UpdateNotificationPreferencesRequest) =>
      apiFetch<{ ok: boolean }>('/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(prefs),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-prefs'] }),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (update: { displayName?: string; bio?: string; avatarUrl?: string }) =>
      apiFetch<Profile>('/profiles/me', { method: 'PUT', body: JSON.stringify(update) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', 'me'] }),
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      type?: 'discussion' | 'course' | 'events' | 'directory';
      isPrivate?: boolean;
      tierIds?: string[];
    }) => apiFetch<Space>('/spaces', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
};

export const useDeleteSpace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (spaceId: string) =>
      apiFetch<{ ok: boolean }>(`/spaces/${spaceId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spaces'] }),
  });
};

export const useCreateTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; priceCents: number; interval: 'month' | 'year' }) =>
      apiFetch<MembershipTier>('/tiers', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tiers'] }),
  });
};
