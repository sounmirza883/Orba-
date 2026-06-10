import { BadRequestException, Controller, Headers, Post, RawBodyRequest, Req } from '@nestjs/common';
import type { Request } from 'express';
import { BillingService } from './billing.service';

/**
 * HTTP endpoint hit directly by Stripe (not via the gateway).
 * Signature is verified against the raw request body.
 */
@Controller('webhooks')
export class StripeWebhookController {
  constructor(private readonly billing: BillingService) {}

  @Post('stripe')
  async handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    await this.billing.handleWebhook(req.rawBody, signature);
    return { received: true };
  }
}
