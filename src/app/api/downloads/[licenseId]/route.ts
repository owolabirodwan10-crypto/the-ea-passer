import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/server/auth/session";
import { getStorageProvider } from "@/server/storage/provider";
import { recordAuditLog } from "@/server/services/audit";

// Product files are never served from a public URL. This route is the only
// path to a signed link, and it checks authentication, ownership, license
// status, and product status before issuing one.
export async function GET(req: NextRequest, { params }: { params: { licenseId: string } }) {
  const sessionToken = cookies().get("eapaser_session")?.value;
  const user = await getSessionUser(sessionToken);
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const license = await prisma.license.findUnique({
    where: { id: params.licenseId },
    include: { product: { include: { versions: { orderBy: { releaseDate: "desc" }, take: 1 } } } },
  });

  if (!license || license.customerId !== user.id) {
    return NextResponse.json({ error: "License not found." }, { status: 404 });
  }
  if (license.status !== "ACTIVE") {
    return NextResponse.json({ error: "This license is not active." }, { status: 403 });
  }
  if (license.product.status !== "APPROVED") {
    return NextResponse.json({ error: "This product is not currently available for download." }, { status: 403 });
  }

  const latestVersion = license.product.versions[0];
  if (!latestVersion) {
    return NextResponse.json({ error: "No downloadable file is available yet." }, { status: 404 });
  }

  const storage = getStorageProvider();
  const signedUrl = await storage.getSignedDownloadUrl(latestVersion.fileRef, 300);

  await prisma.download.create({
    data: {
      customerId: user.id,
      productId: license.productId,
      version: latestVersion.version,
    },
  });

  await recordAuditLog({
    actorId: user.id,
    action: "PRODUCT_DOWNLOADED",
    resource: "Product",
    resourceId: license.productId,
  });

  return NextResponse.json({ url: signedUrl, expiresInSeconds: 300 });
}
