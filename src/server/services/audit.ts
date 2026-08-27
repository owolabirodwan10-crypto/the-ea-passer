import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function recordAuditLog(params: {
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId ?? undefined,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      // Metadata callers pass a loosely-typed Record<string, unknown>.
      // Round-tripping through JSON guarantees it's a plain, JSON-safe
      // value before handing it to Prisma's stricter InputJsonValue type.
      metadata: params.metadata
        ? (JSON.parse(JSON.stringify(params.metadata)) as Prisma.InputJsonValue)
        : undefined,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });
}
