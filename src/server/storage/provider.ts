// Object storage abstraction for product files, screenshots, and other
// uploads. Product files must never be stored under a publicly resolvable
// path; downloads always go through the protected endpoint in
// src/app/api/downloads/[licenseId]/route.ts, which checks ownership and
// license status before asking this provider for a short-lived signed URL.

export interface StorageProvider {
  /** Uploads a buffer under a generated key and returns that key (not a URL). */
  putObject(key: string, data: Buffer, contentType: string): Promise<{ key: string; sizeBytes: number }>;

  /** Produces a short-lived signed URL for an authorized download. */
  getSignedDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  deleteObject(key: string): Promise<void>;
}

const ALLOWED_PRODUCT_FILE_EXTENSIONS = [".ex4", ".ex5", ".set", ".zip", ".pdf"];
const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const MAX_PRODUCT_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export function assertSafeUpload(
  filename: string,
  sizeBytes: number,
  kind: "product_file" | "image"
) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  const allowed = kind === "product_file" ? ALLOWED_PRODUCT_FILE_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
  const maxBytes = kind === "product_file" ? MAX_PRODUCT_FILE_BYTES : MAX_IMAGE_BYTES;

  if (!allowed.includes(ext)) {
    throw new Error(`File type ${ext} is not allowed for ${kind} uploads.`);
  }
  if (sizeBytes > maxBytes) {
    throw new Error(`File exceeds the ${maxBytes / (1024 * 1024)}MB limit for ${kind} uploads.`);
  }
  // Malware scanning hook: call an external scanning service here before
  // the object is persisted, once STORAGE_PROVIDER is configured for
  // production. Uploaded files are treated as untrusted until scanned.
}

class UnconfiguredStorageProvider implements StorageProvider {
  async putObject(): Promise<{ key: string; sizeBytes: number }> {
    throw new Error("No storage provider configured. Set STORAGE_PROVIDER and related credentials.");
  }
  async getSignedDownloadUrl(): Promise<string> {
    throw new Error("No storage provider configured.");
  }
  async deleteObject(): Promise<void> {
    throw new Error("No storage provider configured.");
  }
}

let activeProvider: StorageProvider = new UnconfiguredStorageProvider();

export function registerStorageProvider(provider: StorageProvider) {
  activeProvider = provider;
}

export function getStorageProvider(): StorageProvider {
  return activeProvider;
}
