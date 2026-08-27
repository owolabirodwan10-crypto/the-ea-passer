import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertSafeUpload, getStorageProvider } from "@/server/storage/provider";
import { recordAuditLog } from "@/server/services/audit";
import { notifyAdminTelegram } from "@/server/telegram/notify";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { developer: true },
  });
  if (!product || product.developer.userId !== user.id) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  const version = formData?.get("version")?.toString().trim();
  const releaseNotes = formData?.get("releaseNotes")?.toString().trim() || undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Attach a file." }, { status: 400 });
  }
  if (!version) {
    return NextResponse.json({ error: "Provide a version label, e.g. 1.0.0." }, { status: 400 });
  }

  const existingVersion = await prisma.productVersion.findUnique({
    where: { productId_version: { productId: product.id, version } },
  });
  if (existingVersion) {
    return NextResponse.json({ error: `Version ${version} already exists for this product.` }, { status: 409 });
  }

  try {
    assertSafeUpload(file.name, file.size, "product_file");
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid file." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.slice(file.name.lastIndexOf("."));
  const storageKey = `products/${product.id}/${crypto.randomUUID()}${ext}`;

  const storage = getStorageProvider();
  try {
    await storage.putObject(storageKey, buffer, file.type || "application/octet-stream");
  } catch {
    return NextResponse.json(
      { error: "File storage is not configured yet. An administrator needs to connect a storage provider." },
      { status: 503 }
    );
  }

  const productVersion = await prisma.productVersion.create({
    data: {
      productId: product.id,
      version,
      releaseNotes,
      fileRef: storageKey,
      status: product.status === "APPROVED" ? "APPROVED" : "PENDING_REVIEW",
    },
  });

  await prisma.product.update({ where: { id: product.id }, data: { currentVersion: version } });

  await recordAuditLog({
    actorId: user.id,
    action: "PRODUCT_VERSION_UPLOADED",
    resource: "Product",
    resourceId: product.id,
    metadata: { version },
  });

  if (product.status === "APPROVED") {
    await notifyAdminTelegram({
      event: "NEW_PRODUCT_SUBMISSION",
      summary: `${product.name} got a new file update (v${version}) on an already-live listing`,
    });
  }

  return NextResponse.json({ version: productVersion }, { status: 201 });
}
