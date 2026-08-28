"use client";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-primaryBright/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primaryBright" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusClasses: Record<string, string> = {
    APPROVED: "bg-success/20 text-success",
    PAID: "bg-success/20 text-success",
    ACTIVE: "bg-success/20 text-success",
    PENDING: "bg-warning/20 text-warning",
    PENDING_REVIEW: "bg-warning/20 text-warning",
    REJECTED: "bg-error/20 text-error",
    FAILED: "bg-error/20 text-error",
    EXPIRED: "bg-error/20 text-error",
    CANCELLED: "bg-error/20 text-error",
    SUBMITTED: "bg-primaryBright/20 text-primaryBright",
    UNDER_REVIEW: "bg-warning/20 text-warning",
    DRAFT: "bg-mutedSoft/20 text-mutedSoft",
    ARCHIVED: "bg-mutedSoft/20 text-mutedSoft",
    COMPLETED: "bg-success/20 text-success",
    DELIVERED: "bg-success/20 text-success",
    OPEN: "bg-success/20 text-success",
    IN_PROGRESS: "bg-primaryBright/20 text-primaryBright",
    WAITING: "bg-warning/20 text-warning",
    RESOLVED: "bg-success/20 text-success",
    CLOSED: "bg-mutedSoft/20 text-mutedSoft",
    REQUESTED: "bg-warning/20 text-warning",
    PROCESSING: "bg-primaryBright/20 text-primaryBright",
  };

  const statusLabels: Record<string, string> = {
    APPROVED: "Approved",
    PAID: "Paid",
    ACTIVE: "Active",
    PENDING: "Pending",
    PENDING_REVIEW: "Pending Review",
    REJECTED: "Rejected",
    FAILED: "Failed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    DRAFT: "Draft",
    ARCHIVED: "Archived",
    COMPLETED: "Completed",
    DELIVERED: "Delivered",
    OPEN: "Open",
    IN_PROGRESS: "In Progress",
    WAITING: "Waiting",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    REQUESTED: "Requested",
    PROCESSING: "Processing",
  };

  const label = statusLabels[status] || status;
  const classes = statusClasses[status] || "bg-mutedSoft/20 text-mutedSoft";

  return (
    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", classes, className)}>
      {label}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="bg-surface rounded-card border border-border p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs text-mutedSoft mt-1">{hint}</p>}
    </div>
  );
}