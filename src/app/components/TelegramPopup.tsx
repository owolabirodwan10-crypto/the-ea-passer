"use client";

import { useState, useEffect } from "react";
import { X, Send, Users, ArrowRight } from "lucide-react";

export function TelegramPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasBeenShown) {
        setIsVisible(true);
        setHasBeenShown(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [hasBeenShown]);

  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_CHANNEL || "https://t.me/Ridwanulahii";

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-fade-in">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-bg transition text-mutedSoft hover:text-text"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primaryBright/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-primaryBright" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Join Our Telegram Channel</h3>
            <p className="text-xs text-muted mt-1">
              Get free broker management, Forex EA, BTC EA, Gold EA updates and exclusive drops from EAPASSER.
            </p>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primaryBright text-bg text-sm font-medium rounded-lg hover:opacity-90 transition"
            >
              <Send className="w-4 h-4" />
              Join Telegram Now
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setIsVisible(false)}
              className="mt-2 text-xs text-mutedSoft hover:text-muted transition"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}