import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseService } from '@nexushub/nest-common';
import type {
  AuthenticatedUser,
  SignUploadRequest,
  SignUploadResponse,
  UploadCompletedEvent,
} from '@nexushub/shared-types';
import { randomUUID } from 'node:crypto';

const MAX_FILE_NAME_LENGTH = 255;

const ALLOWED_CONTENT_TYPES: Record<SignUploadRequest['bucket'], RegExp> = {
  avatars: /^image\/(png|jpe?g|webp|gif|avif)$/,
  'post-media': /^(image\/(png|jpe?g|webp|gif|avif)|video\/(mp4|webm))$/,
  'course-files': /^(application\/pdf|application\/zip|image\/.+|video\/.+|audio\/.+)$/,
};

const ALLOWED_EXTENSIONS = /\.(png|jpe?g|webp|gif|avif|mp4|webm|pdf|zip|mp3|wav)$/i;

/**
 * Thin upload-signing service (PRD §9). Validates MIME type + extension,
 * then returns a signed URL — the file itself goes client → Supabase Storage
 * directly and never passes through this service. The 20MB max size is
 * enforced by Supabase Storage bucket file_size_limit configuration.
 */
@Injectable()
export class UploadsService {
  constructor(
    private readonly supabase: SupabaseService,
    @Inject('EVENT_BUS') private readonly eventBus: ClientProxy,
  ) {}

  async signUpload(
    user: AuthenticatedUser,
    request: SignUploadRequest,
  ): Promise<SignUploadResponse> {
    if (request.fileName.length > MAX_FILE_NAME_LENGTH || request.fileName.includes('..')) {
      throw new BadRequestException('Invalid file name');
    }
    if (!ALLOWED_EXTENSIONS.test(request.fileName)) {
      throw new BadRequestException('File extension not allowed');
    }
    if (!ALLOWED_CONTENT_TYPES[request.bucket].test(request.contentType)) {
      throw new BadRequestException(`Content type not allowed for bucket ${request.bucket}`);
    }
    if (request.bucket === 'course-files' && !user.isOwner) {
      throw new BadRequestException('Only the owner can upload course files');
    }

    // Path convention: {userId}/{uuid}-{fileName} — storage RLS checks the folder
    const path = `${user.id}/${randomUUID()}-${request.fileName}`;

    const { data, error } = await this.supabase.client.storage
      .from(request.bucket)
      .createSignedUploadUrl(path);
    if (error || !data) throw new Error(error?.message ?? 'Failed to sign upload');

    const event: UploadCompletedEvent = {
      fileUrl: data.signedUrl,
      bucket: request.bucket,
      userId: user.id,
    };
    this.eventBus.emit('upload.completed', event);

    return { signedUrl: data.signedUrl, path: data.path, token: data.token };
  }
}
