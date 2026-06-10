import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, SignUploadResponse } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { MEDIA_SERVICE } from '../clients';
import { SignUploadDto } from '../dtos';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(@Inject(MEDIA_SERVICE) private readonly media: ClientProxy) {}

  @Post('sign')
  @ApiOperation({ summary: 'Get signed upload URL — client uploads direct to Supabase Storage' })
  sign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: SignUploadDto,
  ): Promise<SignUploadResponse> {
    return firstValueFrom(this.media.send(MessagePatterns.UPLOAD_SIGN, { user, request }));
  }
}
