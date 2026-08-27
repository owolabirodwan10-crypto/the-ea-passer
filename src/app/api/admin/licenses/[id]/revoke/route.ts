import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { requirePermission, AuthError } from "@/server/auth/rbac";
import { recordAuditLog } from "@/server/services/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const actor = await getCurrentUser();
    await requirePermission(actor, "manage_orders");

    const license = await prisma.license.findUnique({ where: { id: params.id } });
    if (!license) return NextResponse.json({ error: "License not found." }, { status: 404 });

    const updated = await prisma.license.update({ where: { id: license.id }, data: { status: "REVOKED" } });

    await recordAuditLog({ actorId: actor!.id, action: "LICENSE_REVOKED", resource: "License", resourceId: license.id });

    return NextResponse.json({ license: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.code === "UNAUTHENTICATED" ? 401 : 403 });
    }
    console.error("[license revoke]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
