import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '@nexushub/nest-common';
import type {
  AuthenticatedUser,
  CourseOutline,
  CourseProgress,
  CreateCourseLessonRequest,
  CreateCourseSectionRequest,
} from '@nexushub/shared-types';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly spaces: SpacesService,
  ) {}

  /** Full course outline for a space: sections → lessons, ordered. */
  async getOutline(spaceSlug: string, user: AuthenticatedUser): Promise<CourseOutline> {
    const space = await this.spaces.getBySlug(spaceSlug, user);

    const { data, error } = await this.supabase.client
      .from('course_sections')
      .select('id, title, sort_order, lessons:course_lessons(id, title, type, content, sort_order)')
      .eq('space_id', space.id)
      .order('sort_order');
    if (error) throw new Error(error.message);

    const sections = (data ?? []).map((section) => ({
      ...section,
      lessons: [...(section.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    })) as CourseOutline['sections'];

    return { spaceId: space.id, sections };
  }

  async createSection(
    spaceSlug: string,
    user: AuthenticatedUser,
    request: CreateCourseSectionRequest,
  ): Promise<{ id: string }> {
    const space = await this.spaces.getBySlug(spaceSlug, user);

    const { data, error } = await this.supabase.client
      .from('course_sections')
      .insert({ space_id: space.id, title: request.title, sort_order: request.sortOrder ?? 0 })
      .select('id')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create section');
    return data;
  }

  async createLesson(request: CreateCourseLessonRequest): Promise<{ id: string }> {
    const { data, error } = await this.supabase.client
      .from('course_lessons')
      .insert({
        section_id: request.sectionId,
        title: request.title,
        type: request.type,
        content: request.content,
        sort_order: request.sortOrder ?? 0,
      })
      .select('id')
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create lesson');
    return data;
  }

  /** Mark a lesson complete (idempotent). */
  async completeLesson(userId: string, lessonId: string): Promise<{ ok: boolean }> {
    const { data: lesson } = await this.supabase.client
      .from('course_lessons')
      .select('id')
      .eq('id', lessonId)
      .maybeSingle();
    if (!lesson) throw new NotFoundException('Lesson not found');

    const { error } = await this.supabase.client
      .from('lesson_progress')
      .upsert({ user_id: userId, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  /** Per-member progress for a course space (PRD §6: % complete). */
  async getProgress(
    spaceSlug: string,
    user: AuthenticatedUser,
  ): Promise<CourseProgress> {
    const outline = await this.getOutline(spaceSlug, user);
    const lessonIds = outline.sections.flatMap((s) => s.lessons.map((l) => l.id));
    if (lessonIds.length === 0) {
      return { completedLessonIds: [], totalLessons: 0, percentComplete: 0 };
    }

    const { data, error } = await this.supabase.client
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .in('lesson_id', lessonIds);
    if (error) throw new Error(error.message);

    const completedLessonIds = (data ?? []).map((r) => r.lesson_id as string);
    return {
      completedLessonIds,
      totalLessons: lessonIds.length,
      percentComplete: Math.round((completedLessonIds.length / lessonIds.length) * 100),
    };
  }
}
