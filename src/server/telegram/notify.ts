// Server-side only. Never import this file from client components, and never
// send TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID to the browser.

type TelegramEvent =
  | "NEW_USER"
  | "NEW_DEVELOPER_APPLICATION"
  | "NEW_PRODUCT_SUBMISSION"
  | "PRODUCT_APPROVED"
  | "NEW_ORDER"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "PAYOUT_REQUESTED"
  | "NEW_REVIEW"
  | "NEW_SUPPORT_TICKET"
  | "NEW_SCOUT_LEAD"
  | "SECURITY_ALERT"
  | "SYSTEM_ERROR";

interface TelegramPayload {
  event: TelegramEvent;
  summary: string;
  // Only non-sensitive, human-readable fields. Never pass passwords, tokens,
  // card numbers, or full authentication secrets into this map.
  fields?: Record<string, string | number>;
}

function formatMessage({ event, summary, fields }: TelegramPayload): string {
  const lines = [`[EAPASER] ${event.replace(/_/g, " ")}`, summary];
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      lines.push(`${key}: ${value}`);
    }
  }
  return lines.join("\n");
}

export async function notifyAdminTelegram(payload: TelegramPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    // Not configured yet. Log locally instead of throwing, so notification
    // failures never block the operation that triggered them.
    console.warn("[telegram] not configured, skipping notification:", payload.event);
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formatMessage(payload),
      }),
    });

    if (!response.ok) {
      console.error("[telegram] send failed", response.status, await response.text());
    }
  } catch (err) {
    console.error("[telegram] send error", err);
  }
}
