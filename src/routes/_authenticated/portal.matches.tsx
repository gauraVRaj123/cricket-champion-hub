import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/matches")({
  component: MyMatches,
});

type Match = { id: string; title: string; opponent: string | null; match_date: string; start_time: string | null; location: string | null; format: string; status: string; notes: string | null };
type Perf = { match_id: string; batting_runs: number; balls_faced: number; fours: number; sixes: number; dismissal: string | null; overs_bowled: number; runs_conceded: number; wickets: number; catches: number };

function MyMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [perfs, setPerfs] = useState<Record<string, Perf>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase.from("students").select("id").eq("user_id", uid).maybeSingle();
      const studentId = (s as { id: string } | null)?.id;
      const { data: m } = await supabase.from("matches").select("*").order("match_date", { ascending: false });
      setMatches((m ?? []) as Match[]);
      if (studentId) {
        const { data: p } = await supabase.from("match_performances").select("*").eq("student_id", studentId);
        const map: Record<string, Perf> = {};
        ((p ?? []) as Perf[]).forEach((r) => { map[r.match_id] = r; });
        setPerfs(map);
      }
      setLoading(false);
    })();
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = matches.filter((m) => m.match_date >= today);
  const past = matches.filter((m) => m.match_date < today);

  return (
    <div>
      <PageHeader eyebrow="[ Matches ]" title="Match Records" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && (
        <div className="space-y-8">
          <Section title="Upcoming" items={upcoming} perfs={perfs} showPerf={false} />
          <Section title="Past Matches" items={past} perfs={perfs} showPerf />
          {matches.length === 0 && <p className="text-sm text-muted-foreground">No matches scheduled yet.</p>}
        </div>
      )}
    </div>
  );
}

function Section({ title, items, perfs, showPerf }: { title: string; items: Match[]; perfs: Record<string, Perf>; showPerf: boolean }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-2xl mb-3">{title}</h2>
      <div className="space-y-3">
        {items.map((m) => {
          const p = perfs[m.id];
          return (
            <div key={m.id} className="border border-border p-5">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-display text-xl">{m.title}{m.opponent ? ` vs ${m.opponent}` : ""}</div>
                  <div className="text-xs text-muted-foreground">{m.match_date}{m.start_time ? ` · ${m.start_time.slice(0, 5)}` : ""}{m.location ? ` · ${m.location}` : ""}</div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary border border-primary px-2 py-1 self-start">{m.format}</span>
              </div>
              {m.notes && <p className="text-sm mt-2 text-muted-foreground">{m.notes}</p>}
              {showPerf && p && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border text-sm">
                  <Stat label="Runs" value={`${p.batting_runs} (${p.balls_faced})`} />
                  <Stat label="4s / 6s" value={`${p.fours} / ${p.sixes}`} />
                  <Stat label="Bowling" value={`${p.wickets}/${p.runs_conceded} (${p.overs_bowled})`} />
                  <Stat label="Catches" value={p.catches} />
                  {p.dismissal && <div className="col-span-full text-xs text-muted-foreground">Dismissal: {p.dismissal}</div>}
                </div>
              )}
              {showPerf && !p && <p className="text-xs text-muted-foreground mt-3">No scorecard recorded.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-primary">{label}</div>
      <div className="font-display text-lg">{value}</div>
    </div>
  );
}