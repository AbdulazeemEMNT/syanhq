import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/messages/")({
  component: MessagesAdmin,
});

type MessageRow = {
  id: string;
  name: string;
  organisation: string | null;
  email: string;
  interest: string | null;
  message: string;
  status: string;
  created_at: string;
};

const statuses = ["new", "read", "replied"] as const;

function MessagesAdmin() {
  const qc = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MessageRow[];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["contact_messages"] });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display-lg text-3xl">Messages</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enquiries submitted through the public contact form.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="soft-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-base font-bold">
                    {m.name}
                    {m.organisation ? ` — ${m.organisation}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <a href={`mailto:${m.email}`} className="underline underline-offset-4">
                      {m.email}
                    </a>
                    {m.interest ? ` · ${m.interest}` : ""} ·{" "}
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(m.id, s)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        m.status === s
                          ? "border-navy bg-navy text-navy-foreground"
                          : "border-hairline bg-card"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {m.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
