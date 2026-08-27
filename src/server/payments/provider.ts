// Payment provider abstraction. Business logic (checkout, webhook handling,
// order/license creation) is written against this interface only, so a real
// provider (Stripe, Paddle, Paystack, etc.) can be dropped in via
// PAYMENT_PROVIDER_KEY without touching checkout logic elsewhere.

export interface PaymentIntentResult {
  providerRef: string;
  redirectUrl?: string;
  clientSecret?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  eventType: string;
  orderProviderRef: string;
  amount: number;
  currency: string;
  raw: unknown;
}

export interface PaymentProvider {
  /** Creates a payment intent/session for an order and returns a reference. */
  createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<PaymentIntentResult>;

  /**
   * Verifies a webhook's signature against PAYMENT_WEBHOOK_SECRET and parses
   * the event. Never trust a webhook body without verifying its signature
   * first, and never treat a frontend "payment succeeded" message as truth.
   */
  verifyWebhook(rawBody: string, signatureHeader: string): Promise<WebhookVerificationResult>;

  /** Issues a refund for a previously captured payment. */
  refund(transactionRef: string, amount?: number): Promise<{ success: boolean }>;
}

/**
 * Throws until a real adapter is registered. This keeps the checkout flow,
 * webhook route, and order/license creation fully implemented and testable
 * end to end, while making it unmistakable that a live provider still needs
 * to be connected via PAYMENT_PROVIDER_KEY and a concrete adapter class.
 */
class UnconfiguredPaymentProvider implements PaymentProvider {
  async createPaymentIntent(): Promise<PaymentIntentResult> {
    throw new Error(
      "No payment provider configured. Set PAYMENT_PROVIDER_KEY and register a " +
        "PaymentProvider implementation in src/server/payments/index.ts."
    );
  }
  async verifyWebhook(): Promise<WebhookVerificationResult> {
    throw new Error("No payment provider configured.");
  }
  async refund(): Promise<{ success: boolean }> {
    throw new Error("No payment provider configured.");
  }
}

let activeProvider: PaymentProvider = new UnconfiguredPaymentProvider();

export function registerPaymentProvider(provider: PaymentProvider) {
  activeProvider = provider;
}

export function getPaymentProvider(): PaymentProvider {
  return activeProvider;
}
