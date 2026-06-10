import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SupabaseService } from '@nexushub/nest-common';
import type {
  AuthenticatedUser,
  CheckoutSessionResponse,
  CreateCheckoutRequest,
  CreateTierRequest,
  MembershipTier,
  SubscriptionActivatedEvent,
  SubscriptionCancelledEvent,
} from '@nexushub/shared-types';
import Stripe from 'stripe';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly supabase: SupabaseService,
    @Inject('EVENT_BUS') private readonly eventBus: ClientProxy,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder');
  }

  async listTiers(tenantId: string | null): Promise<MembershipTier[]> {
    let query = this.supabase.client.from('membership_tiers').select('*').order('price_cents');
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as MembershipTier[];
  }

  async createTier(user: AuthenticatedUser, request: CreateTierRequest): Promise<MembershipTier> {
    let stripePriceId: string | null = null;
    if (request.priceCents > 0) {
      const product = await this.stripe.products.create({ name: request.name });
      const price = await this.stripe.prices.create({
        product: product.id,
        unit_amount: request.priceCents,
        currency: 'usd',
        recurring: { interval: request.interval },
      });
      stripePriceId = price.id;
    }

    const { data, error } = await this.supabase.client
      .from('membership_tiers')
      .insert({
        tenant_id: user.tenantId,
        name: request.name,
        price_cents: request.priceCents,
        interval: request.interval,
        stripe_price_id: stripePriceId,
        is_free: request.priceCents === 0,
      })
      .select()
      .single();
    if (error || !data) throw new Error(error?.message ?? 'Failed to create tier');
    return data as MembershipTier;
  }

  async createCheckout(
    user: AuthenticatedUser,
    request: CreateCheckoutRequest,
  ): Promise<CheckoutSessionResponse> {
    const { data: tier } = await this.supabase.client
      .from('membership_tiers')
      .select('*')
      .eq('id', request.tierId)
      .single();
    if (!tier) throw new NotFoundException('Tier not found');
    if (!tier.stripe_price_id) throw new BadRequestException('Tier has no Stripe price (free tier?)');

    const customerId = await this.getOrCreateStripeCustomer(user);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: tier.stripe_price_id, quantity: 1 }],
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      metadata: { userId: user.id, tierId: tier.id },
      subscription_data: { metadata: { userId: user.id, tierId: tier.id } },
    });
    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url };
  }

  async billingPortal(user: AuthenticatedUser): Promise<CheckoutSessionResponse> {
    const customerId = await this.getOrCreateStripeCustomer(user);
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.BASE_URL ?? 'http://localhost:3100',
    });
    return { url: session.url };
  }

  /**
   * Stripe webhook flow (PRD §9):
   *   checkout.session.completed   → activate tier → publish 'subscription.activated'
   *   customer.subscription.deleted → downgrade to free → publish 'subscription.cancelled'
   *   invoice.payment_failed       → log; user keeps access during 7-day grace period
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tierId = session.metadata?.tierId;
        if (!userId || !tierId) break;

        await this.supabase.client
          .from('profiles')
          .update({ tier_id: tierId, stripe_customer_id: String(session.customer) })
          .eq('id', userId);

        const activated: SubscriptionActivatedEvent = {
          userId,
          tierId,
          stripeSubId: String(session.subscription ?? ''),
        };
        this.eventBus.emit('subscription.activated', activated);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;
        const tierId = subscription.metadata?.tierId;
        if (!userId) break;

        const { data: freeTier } = await this.supabase.client
          .from('membership_tiers')
          .select('id')
          .eq('is_free', true)
          .limit(1)
          .maybeSingle();

        await this.supabase.client
          .from('profiles')
          .update({ tier_id: freeTier?.id ?? null })
          .eq('id', userId);

        const cancelled: SubscriptionCancelledEvent = { userId, tierId: tierId ?? '' };
        this.eventBus.emit('subscription.cancelled', cancelled);
        break;
      }

      case 'invoice.payment_failed': {
        // Grace period: no downgrade here — Stripe retries; downgrade happens
        // on customer.subscription.deleted after retries are exhausted.
        this.logger.warn(`Payment failed for invoice ${event.data.object.id}`);
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  private async getOrCreateStripeCustomer(user: AuthenticatedUser): Promise<string> {
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) return profile.stripe_customer_id;

    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    await this.supabase.client
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id);
    return customer.id;
  }
}
