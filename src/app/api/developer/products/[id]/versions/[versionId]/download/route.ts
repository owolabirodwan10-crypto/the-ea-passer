import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { getStorageProvider } from "@/server/storage/provider";
import { recordAuditLog } from "@/server/services/audit";

// A developer downloading their own uploaded file to verify it, distinct
// from the customer download endpoint at /api/downloads/[licenseId], which
// checks a license instead of developer ownership.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const version = await prisma.productVersion.findUnique({
    where: { id: params.versionId },
    include: { product: { include: { developer: true } } },
  });

  if (!version || version.productId !== params.id || version.product.developer.userId !== user.id) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const storage = getStorageProvider();
  try {
    const url = await storage.getSignedDownloadUrl(version.fileRef, 300);
    await recordAuditLog({
      actorId: user.id,
      action: "DEVELOPER_FILE_DOWNLOADED",
      resource: "ProductVersion",
      resourceId: version.id,
    });
    return NextResponse.json({ url, expiresInSeconds: 300 });
  } catch {
    return NextResponse.json(
      { error: "File storage is not configured yet. An administrator needs to connect a storage provider." },
      { status: 503 }
    );
  }
}
