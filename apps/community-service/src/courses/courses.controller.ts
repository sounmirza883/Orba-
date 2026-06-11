import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type {
  AuthenticatedUser,
  CourseOutline,
  CourseProgress,
  CreateCourseLessonRequest,
  CreateCourseSectionRequest,
} from '@nexushub/shared-types';
import { CoursesService } from './courses.service';

@Controller()
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @MessagePattern(MessagePatterns.COURSE_GET)
  getOutline(
    @Payload() data: { spaceSlug: string; user: AuthenticatedUser },
  ): Promise<CourseOutline> {
    return this.courses.getOutline(data.spaceSlug, data.user);
  }

  @MessagePattern(MessagePatterns.COURSE_SECTION_CREATE)
  createSection(
    @Payload()
    data: { spaceSlug: string; user: AuthenticatedUser; request: CreateCourseSectionRequest },
  ): Promise<{ id: string }> {
    return this.courses.createSection(data.spaceSlug, data.user, data.request);
  }

  @MessagePattern(MessagePatterns.COURSE_LESSON_CREATE)
  createLesson(@Payload() data: { request: CreateCourseLessonRequest }): Promise<{ id: string }> {
    return this.courses.createLesson(data.request);
  }

  @MessagePattern(MessagePatterns.COURSE_LESSON_COMPLETE)
  completeLesson(
    @Payload() data: { userId: string; lessonId: string },
  ): Promise<{ ok: boolean }> {
    return this.courses.completeLesson(data.userId, data.lessonId);
  }

  @MessagePattern(MessagePatterns.COURSE_PROGRESS_GET)
  getProgress(
    @Payload() data: { spaceSlug: string; user: AuthenticatedUser },
  ): Promise<CourseProgress> {
    return this.courses.getProgress(data.spaceSlug, data.user);
  }
}
