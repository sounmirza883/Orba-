import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  avatarUrl?: string;
}

export class CreateSpaceDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(80)
  name!: string;

  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(80)
  slug!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(8)
  icon?: string;

  @ApiPropertyOptional({ enum: ['discussion', 'course', 'events', 'directory'] })
  @IsOptional()
  @IsIn(['discussion', 'course', 'events', 'directory'])
  type?: 'discussion' | 'course' | 'events' | 'directory';

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true })
  tierIds?: string[];
}

export class UpdateSpaceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(80)
  name?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500)
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(8)
  icon?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isPrivate?: boolean;
}

export class CreatePostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  title?: string;

  @ApiProperty({ description: 'TipTap JSON document' }) @IsObject()
  body!: Record<string, unknown>;
}

export class UpdatePostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'TipTap JSON document' }) @IsOptional() @IsObject()
  body?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Owner only' }) @IsOptional() @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: 'Owner only' }) @IsOptional() @IsBoolean()
  isHidden?: boolean;
}

export class CreateCommentDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(5000)
  body!: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true })
  mentionedIds?: string[];
}

export class ToggleReactionDto {
  @ApiProperty({ enum: ['post', 'comment'] }) @IsIn(['post', 'comment'])
  targetType!: 'post' | 'comment';

  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(8)
  emoji!: string;
}

export class PaginationQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 }) @IsOptional() @IsInt() @Min(1) @Max(50)
  limit?: number;
}

export class CreateTierDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(80)
  name!: string;

  @ApiProperty() @IsInt() @Min(0)
  priceCents!: number;

  @ApiProperty({ enum: ['month', 'year'] }) @IsIn(['month', 'year'])
  interval!: 'month' | 'year';
}

export class CreateCheckoutDto {
  @ApiProperty() @IsUUID()
  tierId!: string;

  @ApiProperty() @IsUrl({ require_tld: false })
  successUrl!: string;

  @ApiProperty() @IsUrl({ require_tld: false })
  cancelUrl!: string;
}

export class SignUploadDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(255)
  fileName!: string;

  @ApiProperty() @IsString() @IsNotEmpty()
  contentType!: string;

  @ApiProperty({ enum: ['avatars', 'post-media', 'course-files'] })
  @IsIn(['avatars', 'post-media', 'course-files'])
  bucket!: 'avatars' | 'post-media' | 'course-files';
}

export class CreateCourseSectionDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120)
  title!: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}

export class CreateCourseLessonDto {
  @ApiProperty() @IsUUID()
  sectionId!: string;

  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120)
  title!: string;

  @ApiProperty({ enum: ['text', 'video', 'download'] })
  @IsIn(['text', 'video', 'download'])
  type!: 'text' | 'video' | 'download';

  @ApiPropertyOptional() @IsOptional() @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0)
  sortOrder?: number;
}

export class CreateEventDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(160)
  title!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @ApiProperty({ description: 'ISO 8601 datetime' }) @IsString() @IsNotEmpty()
  startsAt!: string;

  @ApiPropertyOptional({ description: 'ISO 8601 datetime' }) @IsOptional() @IsString()
  endsAt?: string;

  @ApiPropertyOptional({ description: 'Zoom/Meet link' }) @IsOptional() @IsUrl()
  locationUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1)
  rsvpLimit?: number;
}

export class UpdateNotificationPrefsDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  emailReplies?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  emailMentions?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  emailNewPosts?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  weeklyDigest?: boolean;
}

export class CreateDmThreadDto {
  @ApiProperty() @IsUUID()
  recipientId!: string;
}

export class SendDmDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(5000)
  body!: string;
}
