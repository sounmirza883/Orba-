'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AppNotification,
  Comment,
  MembershipTier,
  PaginatedResult,
  Post,
  Profile,
  Space,
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
