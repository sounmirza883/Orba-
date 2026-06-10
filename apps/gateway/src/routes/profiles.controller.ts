import { Body, Controller, Get, Inject, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, OwnerGuard, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, Profile } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE } from '../clients';
import { UpdateProfileDto } from '../dtos';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('profiles')
export class ProfilesController {
  constructor(@Inject(AUTH_SERVICE) private readonly authService: ClientProxy) {}

  @Get('me')
  @ApiOperation({ summary: 'Current user profile + tier' })
  getMe(@CurrentUser() user: AuthenticatedUser): Promise<Profile> {
    return firstValueFrom(
      this.authService.send(MessagePatterns.PROFILE_GET_ME, { userId: user.id }),
    );
  }

  @Put('me')
  @ApiOperation({ summary: 'Update display name, bio, avatar' })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() update: UpdateProfileDto,
  ): Promise<Profile> {
    return firstValueFrom(
      this.authService.send(MessagePatterns.PROFILE_UPDATE_ME, { userId: user.id, update }),
    );
  }

  @Get()
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Member directory (admin)' })
  list(@Query('search') search?: string, @Query('tierId') tierId?: string): Promise<Profile[]> {
    return firstValueFrom(this.authService.send(MessagePatterns.PROFILE_LIST, { search, tierId }));
  }

  @Post(':userId/ban')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Ban a member (owner only)' })
  ban(@Param('userId') userId: string): Promise<{ ok: boolean }> {
    return firstValueFrom(this.authService.send(MessagePatterns.PROFILE_BAN, { userId }));
  }

  @Get(':username')
  @ApiOperation({ summary: 'Public profile view' })
  getByUsername(@Param('username') username: string): Promise<Partial<Profile>> {
    return firstValueFrom(
      this.authService.send(MessagePatterns.PROFILE_GET_BY_USERNAME, { username }),
    );
  }
}
