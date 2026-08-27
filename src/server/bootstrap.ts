import { registerPaymentProvider } from "@/server/payments/provider";
import { registerEmailProvider } from "@/server/email/provider";
import { registerStorageProvider } from "@/server/storage/provider";

/**
 * Called once at process startup (see instrumentation.ts). Each block is
 * independent and only activates when its own environment variables are
 * present, so a deployment can connect providers one at a time. Anything
 * left unconfigured keeps using the throwing/"not configured" fallback
 * already implemented in each provider module — never a fake success.
 */
export async function registerConfiguredProviders() {
  if (process.env.PAYMENT_PROVIDER_KEY && process.env.PAYMENT_WEBHOOK_SECRET) {
    const { StripePaymentProvider } = await import("@/server/payments/stripe-provider");
    registerPaymentProvider(
      new StripePaymentProvider(process.env.PAYMENT_PROVIDER_KEY, process.env.PAYMENT_WEBHOOK_SECRET)
    );
  }

  if (process.env.EMAIL_PROVIDER_KEY && process.env.EMAIL_FROM) {
    const { ResendEmailProvider } = await import("@/server/email/resend-provider");
    registerEmailProvider(new ResendEmailProvider(process.env.EMAIL_PROVIDER_KEY, process.env.EMAIL_FROM));
  }

  if (
    process.env.STORAGE_PROVIDER === "s3" &&
    process.env.STORAGE_BUCKET &&
    process.env.STORAGE_REGION &&
    process.env.STORAGE_ACCESS_KEY &&
    process.env.STORAGE_SECRET_KEY
  ) {
    const { S3StorageProvider } = await import("@/server/storage/s3-provider");
    registerStorageProvider(
      new S3StorageProvider({
        bucket: process.env.STORAGE_BUCKET,
        region: process.env.STORAGE_REGION,
        accessKeyId: process.env.STORAGE_ACCESS_KEY,
        secretAccessKey: process.env.STORAGE_SECRET_KEY,
        endpoint: process.env.STORAGE_ENDPOINT,
      })
    );
  }
}
