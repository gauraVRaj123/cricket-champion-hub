import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";
import { STUDENTS } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/messages")({
  component: CoachMessages,
});

type Msg = {
  id: string;
  recipient: string; // student id or "batch:b1" or "all"
  body: string;
  created_at: string;
};

const KEY = "coach_messages";

function CoachMessages() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [form, setForm] = useState({ recipient: "all", body: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = (next: Msg[]) => {
    setMessages(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.body.trim()) return toast.error("Write a message");
    const m: Msg = {
      id: crypto.randomUUID(),
      recipient: form.recipient,
      body: form.body.trim(),
      created_at: new Date().toISOString(),
    };
    save([m, ...messages]);
    setForm({ recipient: form.recipient, body: "" });
    toast.success("Message sent");
  };

  const label = (r: string) => {
    if (r === "all") return "All students";
    const s = STUDENTS.find((x) => x.id === r);
    return s ? s.name : r;
  };

  return (
    <div>
      <PageHeader eyebrow="[ Messages ]" title="Messaging" />
      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6">
          <h2 className="font-display text-2xl">Send Message</h2>
          <div className="space-y-2">
            <Label>Recipient</Label>
            <select
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
            >
              <option value="all">All students</option>
              {STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={5}
              className="w-full border border-input bg-transparent rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <Button type="submit" className="w-full">Send</Button>
        </form>
        <div>
          <h2 className="font-display text-2xl mb-3">Sent</h2>
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          )}
          <div className="space-y-2">
            {messages.map((m) => (
              <div key={m.id} className="border border-border p-3 text-sm">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  To: {label(m.recipient)}
                </div>
                <p className="mt-1">{m.body}</p>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">
                  {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}