"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfigurationNeeded } from "@/components/ui/Primitives";

export function BuyButton({
  productId,
  alreadyOwned,
  isSignedIn,
}: {
  productId: string;
  alreadyOwned: boolean;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState(false);

  async function handleBuy() {
    if (!isSignedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    setError(null);
    setConfigError(false);

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Could not create order.");

      const checkoutRes = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });
      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok) {
        if (checkoutRes.status === 503) {
          setConfigError(true);
          return;
        }
        throw new Error(checkoutData.error ?? "Could not start checkout.");
      }

      if (checkoutData.redirectUrl) {
        window.location.href = checkoutData.redirectUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (alreadyOwned) {
    return (
      <Button variant="success" className="w-full justify-center" onClick={() => router.push("/dashboard/licenses")}>
        Go to your license
      </Button>
    );
  }

  return (
    <div>
      <Button className="w-full justify-center" onClick={handleBuy} disabled={loading}>
        {loading ? "Starting checkout..." : isSignedIn ? "Buy now" : "Sign in to buy"}
      </Button>
      {error && <p className="mt-2.5 text-[13px] text-error">{error}</p>}
      {configError && (
        <div className="mt-3">
          <ConfigurationNeeded what="A payment provider" />
        </div>
      )}
    </div>
  );
}
