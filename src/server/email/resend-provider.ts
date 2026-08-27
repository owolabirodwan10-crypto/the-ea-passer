import type { EmailProvider, EmailMessage } from "./provider";

// Resend's API is a plain HTTPS POST, so this adapter has no SDK
// dependency — one less package to audit for an operation this simple.
export class ResendEmailProvider implements EmailProvider {
  constructor(private apiKey: string, private fromAddress: string) {}

  async send(message: EmailMessage): Promise<{ success: boolean; providerId?: string }> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.fromAddress,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });

    if (!res.ok) {
      console.error("[email:resend] send failed", res.status, await res.text());
      return { success: false };
    }

    const data = (await res.json()) as { id?: string };
    return { success: true, providerId: data.id };
  }
}
