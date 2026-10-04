import { RequirePermission } from "@/lib/permissions";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/messages/")({
  component: () => (
    <RequirePermission permission="messages.manage">
      <MessagesAdmin />
    </RequirePermission>
  ),
});

type MessageRow = Tables<"contact_messages">;
const tabs = ["inbox", "new", "read", "replied", "archived"] as const;

function MessagesAdmin() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<(typeof tabs)[number]>("inbox");
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: messages = [], isLoading, error } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
    qc.invalidateQueries({ queryKey: ["count"] });
  };

  async function setStatus(id: string, status: string, quiet = false) {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!quiet) toast.success(`Marked as ${status}`);
    refresh();
  }

  async function remove(m: MessageRow) {
    if (!confirm(`Delete the message from ${m.name} permanently?`)) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", m.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Message deleted");
    refresh();
  }

  function open(m: MessageRow) {
    setOpenId(openId === m.id ? null : m.id);
    if (m.status === "new") setStatus(m.id, "read", true);
  }

  const visible = messages.filter((m) =>
    tab === "inbox" ? m.status !== "archived" : m.status === tab,
  );
  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enquiries submitted through the public contact form · {unread} unread
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border border-hairline px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-secondary font-semibold" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="text-sm text-destructive">Couldn't load messages: {(error as Error).message}</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages here.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((m) => {
            const isOpen = openId === m.id;
            const subject = encodeURIComponent(`Re: your enquiry to SYAN Media${m.enquiry_type ? ` — ${m.enquiry_type}` : ""}`);
            return (
              <li key={m.id} className="soft-card p-6">
                <button onClick={() => open(m)} className="flex w-full flex-wrap items-center justify-between gap-3 text-left">
                  <div>
                    <p className={`font-serif text-base ${m.status === "new" ? "font-bold" : "font-semibold"}`}>
                      {m.status === "new" && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />}
                      {m.name}
                      {m.organisation ? ` — ${m.organisation}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.enquiry_type ?? m.interest ?? "General"} · {new Date(m.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full border border-hairline px-3 py-1 text-xs">{m.status}</span>
                </button>
                {isOpen && (
                  <div className="mt-5 space-y-4 border-t border-hairline pt-5">
                    <p className="text-sm">
                      <a href={`mailto:${m.email}?subject=${subject}`} className="font-semibold underline underline-offset-4">
                        {m.email}
                      </a>
                      {m.phone ? <span className="text-muted-foreground"> · {m.phone}</span> : null}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{m.message}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="rounded-full" asChild>
                        <a href={`mailto:${m.email}?subject=${subject}`} onClick={() => setStatus(m.id, "replied", true)}>
                          Reply by email
                        </a>
                      </Button>
                      {m.status !== "read" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(m.id, "read")}>Mark as read</Button>
                      )}
                      {m.status !== "replied" && (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(m.id, "replied")}>Mark as replied</Button>
                      )}
                      {m.status !== "archived" ? (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(m.id, "archived")}>Archive</Button>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(m.id, "read")}>Restore</Button>
                      )}
                      <Button size="sm" variant="destructive" className="rounded-full" onClick={() => remove(m)}>Delete</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
