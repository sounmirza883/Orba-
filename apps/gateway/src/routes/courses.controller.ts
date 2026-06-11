import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, OwnerGuard, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, CourseOutline, CourseProgress } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { COMMUNITY_SERVICE } from '../clients';
import { CreateCourseLessonDto, CreateCourseSectionDto } from '../dtos';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(@Inject(COMMUNITY_SERVICE) private readonly community: ClientProxy) {}

  @Get(':spaceSlug')
  @ApiOperation({ summary: 'Course outline: sections → lessons' })
  getOutline(
    @Param('spaceSlug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseOutline> {
    return firstValueFrom(this.community.send(MessagePatterns.COURSE_GET, { spaceSlug, user }));
  }

  @Get(':spaceSlug/progress')
  @ApiOperation({ summary: 'My progress (% complete) in this course' })
  getProgress(
    @Param('spaceSlug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CourseProgress> {
    return firstValueFrom(
      this.community.send(MessagePatterns.COURSE_PROGRESS_GET, { spaceSlug, user }),
    );
  }

  @Post(':spaceSlug/sections')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Create course section (owner only)' })
  createSection(
    @Param('spaceSlug') spaceSlug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateCourseSectionDto,
  ): Promise<{ id: string }> {
    return firstValueFrom(
      this.community.send(MessagePatterns.COURSE_SECTION_CREATE, { spaceSlug, user, request }),
    );
  }

  @Post('lessons')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Create lesson in a section (owner only)' })
  createLesson(@Body() request: CreateCourseLessonDto): Promise<{ id: string }> {
    return firstValueFrom(this.community.send(MessagePatterns.COURSE_LESSON_CREATE, { request }));
  }

  @Post('lessons/:lessonId/complete')
  @ApiOperation({ summary: 'Mark lesson complete' })
  completeLesson(
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ ok: boolean }> {
    return firstValueFrom(
      this.community.send(MessagePatterns.COURSE_LESSON_COMPLETE, {
        userId: user.id,
        lessonId,
      }),
    );
  }
}
