"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Primitives";

export interface AdminTicketMessage {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export function AdminTicketPanel({
  ticketId,
  subject,
  status,
  customerName,
  messages,
}: {
  ticketId: string;
  subject: string;
  status: string;
  customerName: string;
  messages: AdminTicketMessage[];
}) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(newStatus?: string) {
    if (!reply.trim() && !newStatus) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/support/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: reply.trim() || undefined, status: newStatus }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      return;
    }
    setReply("");
    router.refresh();
  }

  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-semibold">{subject}</h3>
          <p className="text-xs text-mutedSoft">{customerName}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-borderSoft bg-bg/40 p-3 text-[13px]">
            <div className="mb-1 text-[11px] font-medium text-mutedSoft">{m.authorName}</div>
            <div className="text-muted">{m.content}</div>
          </div>
        ))}
      </div>

      <textarea
        rows={2}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write a reply..."
        className="mb-2.5 w-full rounded-lg border border-border bg-bg px-3 py-2 text-[13px] outline-none focus:border-primary/50"
      />
      {error && <p className="mb-2 text-[12px] text-error">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={loading} onClick={() => send()}>Reply</Button>
        <Button size="sm" variant="ghost" disabled={loading} onClick={() => send("RESOLVED")}>Mark resolved</Button>
        <Button size="sm" variant="ghost" disabled={loading} onClick={() => send("CLOSED")}>Close</Button>
      </div>
    </div>
  );
}
