import { describe, expect, it, vi } from 'vitest';
import { ProfilesService } from './profiles.service';
import type { SupabaseService } from '@nexushub/nest-common';

interface QueryResult {
  data: unknown;
  error: { message: string } | null;
}

function mockSupabase(result: QueryResult): SupabaseService {
  const builder: Record<string, unknown> = {};
  const chain = (): Record<string, unknown> => builder;
  for (const method of ['from', 'select', 'update', 'eq', 'or', 'order', 'limit']) {
    builder[method] = vi.fn(chain);
  }
  builder['single'] = vi.fn(() => Promise.resolve(result));
  builder['then'] = (resolve: (value: QueryResult) => unknown): unknown =>
    Promise.resolve(result).then(resolve);
  return { client: builder } as unknown as SupabaseService;
}

describe('ProfilesService', () => {
  it('returns the profile for getMe', async () => {
    const profile = { id: 'u1', display_name: 'Ali' };
    const service = new ProfilesService(mockSupabase({ data: profile, error: null }));
    await expect(service.getMe('u1')).resolves.toEqual(profile);
  });

  it('throws NotFound when profile is missing', async () => {
    const service = new ProfilesService(
      mockSupabase({ data: null, error: { message: 'not found' } }),
    );
    await expect(service.getMe('missing')).rejects.toThrow('Profile not found');
  });

  it('lists profiles with search filter applied', async () => {
    const rows = [{ id: 'u1' }, { id: 'u2' }];
    const service = new ProfilesService(mockSupabase({ data: rows, error: null }));
    await expect(service.list('ali')).resolves.toEqual(rows);
  });
});
