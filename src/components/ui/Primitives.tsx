import { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const statusStyles: Record<string, string> = {
  DRAFT: "text-mutedSoft bg-white/[0.03] border-border",
  PENDING_REVIEW: "text-warning bg-warning/10 border-warning/30",
  CHANGES_REQUESTED: "text-warning bg-warning/10 border-warning/30",
  APPROVED: "text-success bg-success/10 border-success/30",
  REJECTED: "text-error bg-error/10 border-error/30",
  ARCHIVED: "text-mutedSoft bg-white/[0.03] border-border",
  ACTIVE: "text-success bg-success/10 border-success/30",
  EXPIRED: "text-mutedSoft bg-white/[0.03] border-border",
  REVOKED: "text-error bg-error/10 border-error/30",
  PENDING: "text-warning bg-warning/10 border-warning/30",
  PAID: "text-success bg-success/10 border-success/30",
  FAILED: "text-error bg-error/10 border-error/30",
  REFUNDED: "text-mutedSoft bg-white/[0.03] border-border",
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? "text-mutedSoft bg-white/[0.03] border-border";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${style}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface px-8 py-14 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface2 text-muted">
        <Icon size={20} />
      </div>
      <h3 className="mb-2 text-[17px] font-semibold">{title}</h3>
      <p className="mx-auto mb-5 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-mutedSoft">{label}</div>
      <div className="font-display text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}

export function ConfigurationNeeded({ what }: { what: string }) {
  return (
    <div className="rounded-card border border-warning/30 bg-warning/[0.06] p-4 text-sm text-warning">
      {what} is not configured yet in this environment. This action is fully wired to the backend
      and will work as soon as real credentials are added.
    </div>
  );
}
