import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns, type UserBannedEvent } from '@nexushub/shared-types';
import type { Profile, UpdateProfileRequest } from '@nexushub/shared-types';
import { ProfilesService } from './profiles.service';

@Controller()
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @MessagePattern(MessagePatterns.PROFILE_GET_ME)
  getMe(@Payload() data: { userId: string }): Promise<Profile> {
    return this.profiles.getMe(data.userId);
  }

  @MessagePattern(MessagePatterns.PROFILE_UPDATE_ME)
  updateMe(@Payload() data: { userId: string; update: UpdateProfileRequest }): Promise<Profile> {
    return this.profiles.updateMe(data.userId, data.update);
  }

  @MessagePattern(MessagePatterns.PROFILE_GET_BY_USERNAME)
  getByUsername(@Payload() data: { username: string }): Promise<Partial<Profile>> {
    return this.profiles.getByUsername(data.username);
  }

  @MessagePattern(MessagePatterns.PROFILE_LIST)
  list(@Payload() data: { search?: string; tierId?: string }): Promise<Partial<Profile>[]> {
    return this.profiles.list(data.search, data.tierId);
  }

  @MessagePattern(MessagePatterns.PROFILE_BAN)
  async ban(@Payload() data: { userId: string }): Promise<{ ok: boolean }> {
    await this.profiles.ban(data.userId);
    return { ok: true };
  }

  @EventPattern('user.banned')
  async onUserBanned(@Payload() event: UserBannedEvent): Promise<void> {
    await this.profiles.ban(event.userId);
  }
}
