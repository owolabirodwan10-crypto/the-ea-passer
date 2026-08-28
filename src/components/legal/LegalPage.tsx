import type React from "react";

interface LegalPageProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPage({ title, children }: LegalPageProps) {
  return (
    <div className="container-custom py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      <div className="prose prose-invert max-w-none">{children}</div>
    </div>
  );
}