import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, OwnerGuard, SupabaseAuthGuard } from '@nexushub/nest-common';
import { MessagePatterns } from '@nexushub/shared-types';
import type { AuthenticatedUser, CheckoutSessionResponse, MembershipTier } from '@nexushub/shared-types';
import { firstValueFrom } from 'rxjs';
import { MEMBERSHIP_SERVICE } from '../clients';
import { CreateCheckoutDto, CreateTierDto } from '../dtos';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller()
export class BillingController {
  constructor(@Inject(MEMBERSHIP_SERVICE) private readonly membership: ClientProxy) {}

  @Get('tiers')
  @ApiOperation({ summary: 'List membership tiers' })
  listTiers(@CurrentUser() user: AuthenticatedUser): Promise<MembershipTier[]> {
    return firstValueFrom(
      this.membership.send(MessagePatterns.TIERS_LIST, { tenantId: user.tenantId }),
    );
  }

  @Post('tiers')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Create tier (owner only)' })
  createTier(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateTierDto,
  ): Promise<MembershipTier> {
    return firstValueFrom(this.membership.send(MessagePatterns.TIERS_CREATE, { user, request }));
  }

  @Post('checkout')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Create Stripe checkout session → return URL' })
  createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() request: CreateCheckoutDto,
  ): Promise<CheckoutSessionResponse> {
    return firstValueFrom(this.membership.send(MessagePatterns.CHECKOUT_CREATE, { user, request }));
  }

  @Get('billing/portal')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Stripe customer portal URL' })
  billingPortal(@CurrentUser() user: AuthenticatedUser): Promise<CheckoutSessionResponse> {
    return firstValueFrom(this.membership.send(MessagePatterns.BILLING_PORTAL, { user }));
  }
}
