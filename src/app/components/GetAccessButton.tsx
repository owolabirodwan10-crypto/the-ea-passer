"use client";

import { useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

interface GetAccessButtonProps {
  productId: string;
  productName: string;
  telegramUsername?: string;
  telegramUrl?: string;
  telegramMessage?: string;
  className?: string;
  children?: React.ReactNode;
}

export function GetAccessButton({
  productId,
  productName,
  telegramUsername,
  telegramUrl,
  telegramMessage,
  className = "",
  children,
}: GetAccessButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      // Record the lead
      const res = await fetch(`/api/lead?product=${productId}&source=website`);
      const data = await res.json();

      // Use product-specific Telegram or fallback to DM
      let tgUrl = telegramUrl || process.env.NEXT_PUBLIC_TELEGRAM_DM || "https://t.me/propfirmeapasser1";
      
      // If username provided but no URL, construct URL
      if (telegramUsername && !telegramUrl) {
        tgUrl = `https://t.me/${telegramUsername.replace('@', '')}`;
      }

      // Pre-filled message
      const message = telegramMessage || `Hi, I'm interested in ${productName}.`;
      const encodedMessage = encodeURIComponent(message);
      const fullUrl = `${tgUrl}?text=${encodedMessage}`;

      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('Failed to redirect to Telegram:', error);
      // Fallback: use DM
      const fallbackUrl = process.env.NEXT_PUBLIC_TELEGRAM_DM || "https://t.me/propfirmeapasser1";
      window.open(fallbackUrl, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children || (
          <>
            Get Access
            <ArrowRight className="w-4 h-4" />
          </>
        )
      )}
    </button>
  );
}
// Add import
import { GetAccessButton } from "@/components/GetAccessButton";

// In the product detail page, replace the Link with:
<GetAccessButton
  productId={product.id}
  productName={product.name}
  telegramUsername={product.telegram_username}
  telegramUrl={product.telegram_url}
  telegramMessage={product.telegram_message}
  className="btn-primary flex-1 justify-center text-center"
/>