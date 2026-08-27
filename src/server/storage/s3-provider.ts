import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider } from "./provider";

// Works with AWS S3 directly, or any S3-compatible endpoint (Cloudflare R2,
// Backblaze B2, DigitalOcean Spaces) by setting a custom endpoint. Objects
// are stored under private ACLs; every download goes through
// getSignedDownloadUrl, never a public bucket URL.
export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(params: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  }) {
    this.bucket = params.bucket;
    this.client = new S3Client({
      region: params.region,
      endpoint: params.endpoint,
      credentials: {
        accessKeyId: params.accessKeyId,
        secretAccessKey: params.secretAccessKey,
      },
    });
  }

  async putObject(key: string, data: Buffer, contentType: string): Promise<{ key: string; sizeBytes: number }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
        // No ACL set: bucket is expected to be fully private. Public
        // access should be blocked at the bucket policy level.
      })
    );
    return { key, sizeBytes: data.byteLength };
  }

  async getSignedDownloadUrl(key: string, expiresInSeconds = 300): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
