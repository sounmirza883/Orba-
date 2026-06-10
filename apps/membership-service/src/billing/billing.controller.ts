import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MessagePatterns } from '@nexushub/shared-types';
import type {
  AuthenticatedUser,
  CheckoutSessionResponse,
  CreateCheckoutRequest,
  CreateTierRequest,
  MembershipTier,
} from '@nexushub/shared-types';
import { BillingService } from './billing.service';

@Controller()
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  @MessagePattern(MessagePatterns.TIERS_LIST)
  listTiers(@Payload() data: { tenantId: string | null }): Promise<MembershipTier[]> {
    return this.billing.listTiers(data.tenantId);
  }

  @MessagePattern(MessagePatterns.TIERS_CREATE)
  createTier(
    @Payload() data: { user: AuthenticatedUser; request: CreateTierRequest },
  ): Promise<MembershipTier> {
    return this.billing.createTier(data.user, data.request);
  }

  @MessagePattern(MessagePatterns.CHECKOUT_CREATE)
  createCheckout(
    @Payload() data: { user: AuthenticatedUser; request: CreateCheckoutRequest },
  ): Promise<CheckoutSessionResponse> {
    return this.billing.createCheckout(data.user, data.request);
  }

  @MessagePattern(MessagePatterns.BILLING_PORTAL)
  billingPortal(@Payload() data: { user: AuthenticatedUser }): Promise<CheckoutSessionResponse> {
    return this.billing.billingPortal(data.user);
  }
}
