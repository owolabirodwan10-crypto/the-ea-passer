import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/server/payments/provider";
import { recordAuditLog } from "@/server/services/audit";
import { notifyAdminTelegram } from "@/server/telegram/notify";
import { sendEmail } from "@/server/email/provider";

// Payment success is only ever trusted from a verified webhook call, never
// from a redirect the browser lands on after checkout. The browser success
// page polls order status; it never flips it.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  // Stripe sends its webhook signature in the "Stripe-Signature" header.
  // If a different payment provider is registered later, update this to
  // match that provider's signature header convention.
  const signature = req.headers.get("stripe-signature") ?? "";

  const provider = getPaymentProvider();
  let event;
  try {
    event = await provider.verifyWebhook(rawBody, signature);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (!event.valid) {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  // Only PAYMENT_SUCCEEDED and PAYMENT_FAILED are acted on. Any other
  // event type a provider forwards (e.g. an unrelated Stripe event) is
  // acknowledged and ignored rather than falling through to the success
  // path below, which would otherwise treat an unrecognized event as a
  // paid order.
  if (event.eventType !== "PAYMENT_SUCCEEDED" && event.eventType !== "PAYMENT_FAILED") {
    return NextResponse.json({ received: true, ignored: event.eventType });
  }

  const order = await prisma.order.findFirst({
    where: { paymentProviderRef: event.orderProviderRef },
    include: { items: { include: { product: true } }, customer: true },
  });

  if (!order) {
    console.error("[webhook] order not found for provider ref", event.orderProviderRef);
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotency: a webhook can be delivered more than once.
  if (order.status === "PAID") {
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  if (event.eventType === "PAYMENT_FAILED") {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    await notifyAdminTelegram({ event: "PAYMENT_FAILED", summary: `Payment failed for order ${order.orderNumber}` });
    return NextResponse.json({ received: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    await tx.payment.create({
      data: {
        orderId: order.id,
        provider: "configured_provider",
        transactionRef: event.orderProviderRef,
        amount: event.amount,
        currency: event.currency,
        status: "SUCCEEDED",
        // Prisma's Json field expects a JSON-safe value, not an arbitrary
        // object graph (the raw provider event may include class
        // instances or undefined values that InputJsonValue disallows).
        // Round-tripping through JSON.stringify/parse guarantees a plain,
        // serializable value before it's cast for Prisma.
        metadata: JSON.parse(JSON.stringify(event.raw)) as Prisma.InputJsonValue,
      },
    });

    for (const item of order.items) {
      await tx.license.create({
        data: {
          licenseKey: crypto.randomUUID(),
          productId: item.productId,
          customerId: order.customerId,
          activationLimit: 1,
          status: "ACTIVE",
        },
      });
    }
  });

  await recordAuditLog({
    actorId: order.customerId,
    action: "ORDER_PAID",
    resource: "Order",
    resourceId: order.id,
    metadata: { total: order.total.toString(), currency: order.currency },
  });

  await sendEmail({
    to: order.customer.email,
    subject: `Your EAPASER order ${order.orderNumber} is confirmed`,
    html: `<p>Payment received. Your license and download are now available in your dashboard.</p>`,
  });

  await notifyAdminTelegram({
    event: "PAYMENT_SUCCEEDED",
    summary: `Order ${order.orderNumber} paid`,
    fields: { amount: `${order.total} ${order.currency}` },
  });

  return NextResponse.json({ received: true });
}
