import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, CreateSpaceRequest, Space } from '@nexushub/shared-types';
import { SpacesService } from './spaces.service';

@Controller()
export class SpacesController {
  constructor(private readonly spaces: SpacesService) {}

  @MessagePattern(MessagePatterns.SPACES_LIST)
  list(@Payload() data: { user: AuthenticatedUser }): Promise<Space[]> {
    return this.spaces.listForUser(data.user);
  }

  @MessagePattern(MessagePatterns.SPACES_CREATE)
  create(
    @Payload() data: { user: AuthenticatedUser; request: CreateSpaceRequest },
  ): Promise<Space> {
    return this.spaces.create(data.user, data.request);
  }

  @MessagePattern(MessagePatterns.SPACES_UPDATE)
  update(
    @Payload() data: { spaceId: string; patch: Partial<CreateSpaceRequest> },
  ): Promise<Space> {
    return this.spaces.update(data.spaceId, data.patch);
  }

  @MessagePattern(MessagePatterns.SPACES_DELETE)
  async remove(@Payload() data: { spaceId: string }): Promise<{ ok: boolean }> {
    await this.spaces.delete(data.spaceId);
    return { ok: true };
  }
}
