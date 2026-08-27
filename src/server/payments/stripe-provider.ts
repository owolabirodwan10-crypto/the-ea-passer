import Stripe from "stripe";
import type { PaymentProvider, PaymentIntentResult, WebhookVerificationResult } from "./provider";

// Concrete Stripe adapter. Uses Stripe Checkout Sessions so the redirect
// flow already assumed by BuyButton (redirectUrl) works without extra
// client-side Stripe.js integration. Swap this file for a different
// provider's adapter without touching any call site — everything else in
// the app talks to the PaymentProvider interface only.
export class StripePaymentProvider implements PaymentProvider {
  private client: Stripe;
  private webhookSecret: string;

  constructor(apiKey: string, webhookSecret: string) {
    // apiVersion intentionally omitted: the Stripe SDK's TypeScript types
    // pin this to an exact literal tied to the installed package version,
    // so hardcoding a version string here risks a type mismatch on
    // upgrade. Omitting it uses the SDK's own compiled-in default, which
    // always matches whatever version of the `stripe` package is
    // installed.
    this.client = new Stripe(apiKey);
    this.webhookSecret = webhookSecret;
  }

  async createPaymentIntent(params: {
    orderId: string;
    amount: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<PaymentIntentResult> {
    const session = await this.client.checkout.sessions.create({
      mode: "payment",
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      client_reference_id: params.orderId,
      line_items: [
        {
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: Math.round(params.amount * 100),
            product_data: { name: `EAPASER order ${params.orderId}` },
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: params.orderId },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return { providerRef: session.id, redirectUrl: session.url };
  }

  async verifyWebhook(rawBody: string, signatureHeader: string): Promise<WebhookVerificationResult> {
    const event = this.client.webhooks.constructEvent(rawBody, signatureHeader, this.webhookSecret);

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        valid: true,
        eventType: "PAYMENT_SUCCEEDED",
        orderProviderRef: session.id,
        amount: (session.amount_total ?? 0) / 100,
        currency: (session.currency ?? "usd").toUpperCase(),
        raw: event,
      };
    }

    if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        valid: true,
        eventType: "PAYMENT_FAILED",
        orderProviderRef: session.id,
        amount: 0,
        currency: (session.currency ?? "usd").toUpperCase(),
        raw: event,
      };
    }

    // Event type we don't act on. Still a validly-signed webhook, so
    // report it as valid with a neutral event type rather than erroring.
    return {
      valid: true,
      eventType: event.type,
      orderProviderRef: "",
      amount: 0,
      currency: "USD",
      raw: event,
    };
  }

  async refund(transactionRef: string, amount?: number): Promise<{ success: boolean }> {
    const session = await this.client.checkout.sessions.retrieve(transactionRef);
    if (!session.payment_intent) return { success: false };

    await this.client.refunds.create({
      payment_intent: session.payment_intent as string,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
    return { success: true };
  }
}
