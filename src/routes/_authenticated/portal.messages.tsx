import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/messages")({
  component: Messages,
});

type Msg = { id: string; sender_id: string; body: string; read_at: string | null; created_at: string };
type Ann = { id: string; title: string; body: string; created_at: string };

function Messages() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [anns, setAnns] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase.from("students").select("id").eq("user_id", uid).maybeSingle();
      const studentId = (s as { id: string } | null)?.id;
      const [{ data: a }, m] = await Promise.all([
        supabase.from("announcements").select("id,title,body,created_at").order("created_at", { ascending: false }),
        studentId
          ? supabase.from("messages").select("*").eq("recipient_student_id", studentId).order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as Msg[] }),
      ]);
      const messages = (m.data ?? []) as Msg[];
      setMsgs(messages);
      setAnns((a ?? []) as Ann[]);
      setLoading(false);
      // mark unread as read
      const unread = messages.filter((x) => !x.read_at).map((x) => x.id);
      if (unread.length) {
        await supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", unread);
      }
    })();
  }, []);

  return (
    <div>
      <PageHeader eyebrow="[ Inbox ]" title="Messages & Announcements" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && (
        <div className="grid lg:grid-cols-2 gap-8">
          <section>
            <h2 className="font-display text-2xl mb-4">Announcements</h2>
            {anns.length === 0 && <p className="text-sm text-muted-foreground">No announcements.</p>}
            <div className="space-y-3">
              {anns.map((a) => (
                <div key={a.id} className="border border-border p-4">
                  <div className="font-semibold">{a.title}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">{new Date(a.created_at).toLocaleDateString()}</div>
                  <p className="text-sm whitespace-pre-wrap">{a.body}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-4">From Your Coach</h2>
            {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            <div className="space-y-3">
              {msgs.map((m) => (
                <div key={m.id} className="border border-border p-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">{new Date(m.created_at).toLocaleString()}</div>
                  <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}