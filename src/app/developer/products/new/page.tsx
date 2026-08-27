import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/current-user";
import { ProductForm } from "@/components/developer/ProductForm";

export default async function NewProductPage() {
  const user = (await getCurrentUser())!;
  const developer = await prisma.developer.findUnique({ where: { userId: user.id } });
  if (!developer) redirect("/developer");

  const categories = await prisma.productCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display mb-1 text-2xl font-bold">New product</h1>
      <p className="mb-8 text-sm text-muted">
        Saved as a draft first. You can keep editing before submitting it for admin review.
      </p>
      <ProductForm categories={categories} mode="create" />
    </div>
  );
}
