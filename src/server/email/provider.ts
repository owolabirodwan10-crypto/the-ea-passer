// Email provider abstraction. Same pattern as payments: business logic
// (verification emails, order receipts, notifications) calls sendEmail()
// only, so a real provider (Postmark, Resend, SES, SendGrid) can be wired
// in via EMAIL_PROVIDER_KEY without touching call sites.

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ success: boolean; providerId?: string }>;
}

class UnconfiguredEmailProvider implements EmailProvider {
  async send(message: EmailMessage) {
    console.warn(`[email] not configured, would have sent "${message.subject}" to ${message.to}`);
    return { success: false };
  }
}

let activeProvider: EmailProvider = new UnconfiguredEmailProvider();

export function registerEmailProvider(provider: EmailProvider) {
  activeProvider = provider;
}

export async function sendEmail(message: EmailMessage) {
  return activeProvider.send(message);
}
