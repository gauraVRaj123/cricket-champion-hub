import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/DashboardShell";
import { MATCHES, type Match } from "@/lib/coachDummy";

export const Route = createFileRoute("/_authenticated/coach/matches")({
  component: CoachMatches,
});

const KEY = "coach_matches";

function CoachMatches() {
  const [matches, setMatches] = useState<Match[]>(MATCHES);
  const [form, setForm] = useState({
    title: "",
    opponent: "",
    match_date: "",
    start_time: "09:00",
    location: "",
    format: "T20",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setMatches(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = (next: Match[]) => {
    setMatches(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.match_date) return toast.error("Title and date required");
    const m: Match = {
      id: crypto.randomUUID(),
      title: form.title,
      opponent: form.opponent,
      match_date: form.match_date,
      start_time: form.start_time,
      location: form.location,
      format: form.format,
      status: "upcoming",
    };
    save([m, ...matches]);
    setForm({ title: "", opponent: "", match_date: "", start_time: "09:00", location: "", format: "T20" });
    toast.success("Match scheduled");
  };

  const upcoming = matches.filter((m) => m.status === "upcoming");
  const completed = matches.filter((m) => m.status === "completed");

  return (
    <div>
      <PageHeader eyebrow="[ Matches ]" title="Match Management" />
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <form onSubmit={submit} className="space-y-3 border border-border p-6 h-fit">
          <h2 className="font-display text-2xl">Schedule Match</h2>
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Opponent</Label>
            <Input value={form.opponent} onChange={(e) => setForm({ ...form, opponent: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input type="date" value={form.match_date} onChange={(e) => setForm({ ...form, match_date: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Format</Label>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
              className="w-full h-9 border border-input bg-transparent rounded-md px-3 text-sm"
            >
              <option>T20</option><option>ODI</option><option>Test</option><option>Practice</option>
            </select>
          </div>
          <Button type="submit" className="w-full">Schedule</Button>
        </form>

        <div className="space-y-6">
          <section>
            <h2 className="font-display text-2xl mb-3">Upcoming</h2>
            {upcoming.length === 0 && <p className="text-sm text-muted-foreground">None scheduled.</p>}
            <div className="space-y-2">
              {upcoming.map((m) => (
                <div key={m.id} className="border border-border p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                    {m.match_date} · {m.start_time} · {m.format}
                  </div>
                  <div className="font-display text-lg">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.opponent} · {m.location}</div>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">Completed</h2>
            <div className="space-y-2">
              {completed.map((m) => (
                <div key={m.id} className="border border-border p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                    {m.match_date} · {m.format}
                  </div>
                  <div className="font-display text-lg">{m.title}</div>
                  <div className="text-xs">{m.result}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}