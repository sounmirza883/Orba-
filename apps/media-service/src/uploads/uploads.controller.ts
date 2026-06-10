import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, SignUploadRequest, SignUploadResponse } from '@nexushub/shared-types';
import { UploadsService } from './uploads.service';

@Controller()
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @MessagePattern(MessagePatterns.UPLOAD_SIGN)
  sign(
    @Payload() data: { user: AuthenticatedUser; request: SignUploadRequest },
  ): Promise<SignUploadResponse> {
    return this.uploads.signUpload(data.user, data.request);
  }
}
