import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { ProductForm } from "@/components/developer/ProductForm";
import { StatusBadge } from "@/components/ui/Primitives";
import { SubmitForReviewButton } from "./SubmitForReviewButton";
import { VersionUploadForm } from "./VersionUploadForm";
import { VersionList } from "./VersionList";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const user = (await getCurrentUser())!;

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { developer: true, category: true, versions: true },
  });

  if (!product || product.developer.userId !== user.id) notFound();

  const categories = await prisma.productCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  const canEdit = product.status === "DRAFT" || product.status === "CHANGES_REQUESTED" || product.status === "APPROVED";
  const canSubmit = product.status === "DRAFT" || product.status === "CHANGES_REQUESTED";

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold">{product.name}</h1>
        <StatusBadge status={product.status} />
      </div>

      {product.status === "PENDING_REVIEW" && (
        <p className="mb-6 max-w-2xl rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-[13.5px] text-warning">
          This listing is with the review team. Editing is locked until it&apos;s approved or changes are requested.
        </p>
      )}
      {product.status === "REJECTED" && product.reviewNotes && (
        <p className="mb-6 max-w-2xl rounded-lg border border-error/30 bg-error/10 px-4 py-2.5 text-[13.5px] text-error">
          Rejected: {product.reviewNotes}
        </p>
      )}

      <div className="mb-10">
        <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-mutedSoft">Product file</h2>
        {product.versions.length > 0 && (
          <div className="mb-4">
            <VersionList
              productId={product.id}
              versions={product.versions
                .sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime())
                .map((v) => ({
                  id: v.id,
                  version: v.version,
                  status: v.status,
                  releaseDate: v.releaseDate.toISOString(),
                  releaseNotes: v.releaseNotes,
                }))}
            />
          </div>
        )}
        <VersionUploadForm productId={product.id} />
      </div>

      {canEdit ? (
        <ProductForm
          categories={categories}
          mode="edit"
          productId={product.id}
          initialValues={{
            name: product.name,
            categoryId: product.categoryId,
            shortDescription: product.shortDescription,
            description: product.description,
            platform: product.platform,
            price: Number(product.price),
            strategy: product.strategy ?? "",
            requirements: product.requirements ?? "",
            riskLevel: product.riskLevel,
          }}
        />
      ) : (
        <p className="text-[13.5px] text-mutedSoft">Editing is unavailable while this product is {product.status.toLowerCase()}.</p>
      )}

      {canSubmit && (
        <div className="mt-8 border-t border-borderSoft pt-6">
          <SubmitForReviewButton productId={product.id} />
        </div>
      )}
    </div>
  );
}
