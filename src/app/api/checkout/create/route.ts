import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { getPaymentProvider } from "@/server/payments/provider";
import { recordAuditLog } from "@/server/services/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  if (!orderId) return NextResponse.json({ error: "Missing orderId." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "This order has already been processed." }, { status: 409 });
  }

  const provider = getPaymentProvider();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const intent = await provider.createPaymentIntent({
      orderId: order.id,
      amount: Number(order.total),
      currency: order.currency,
      successUrl: `${appUrl}/dashboard/orders?status=success`,
      cancelUrl: `${appUrl}/dashboard/orders?status=cancelled`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentProviderRef: intent.providerRef },
    });

    await recordAuditLog({
      actorId: user.id,
      action: "CHECKOUT_STARTED",
      resource: "Order",
      resourceId: order.id,
    });

    return NextResponse.json({ redirectUrl: intent.redirectUrl, clientSecret: intent.clientSecret });
  } catch {
    // The provider abstraction is fully wired; this only fires when no real
    // provider has been registered yet (see src/server/payments/provider.ts).
    // Never invent a fake successful redirect here.
    return NextResponse.json(
      { error: "Payment provider is not configured yet. An administrator needs to connect one." },
      { status: 503 }
    );
  }
}
