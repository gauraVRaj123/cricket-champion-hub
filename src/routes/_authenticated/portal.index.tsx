import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: StudentDashboard,
});

type Ann = { id: string; title: string; body: string; created_at: string };
type Match = { id: string; title: string; opponent: string | null; match_date: string; start_time: string | null; location: string | null };
type Batch = { batch_name: string; days: string; start_time: string; end_time: string; location: string | null } | null;

function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<string>("—");
  const [feeStatus, setFeeStatus] = useState<"Paid" | "Pending" | "—">("—");
  const [batch, setBatch] = useState<Batch>(null);
  const [announcements, setAnnouncements] = useState<Ann[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: prof }, { data: stu }, { data: anns }, { data: ms }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("students").select("id,batch_id,monthly_fee").eq("user_id", user.id).maybeSingle(),
        supabase.from("announcements").select("id,title,body,created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("matches").select("id,title,opponent,match_date,start_time,location").gte("match_date", new Date().toISOString().slice(0, 10)).order("match_date").limit(3),
      ]);
      setFullName((prof as { full_name?: string } | null)?.full_name ?? "");
      setAnnouncements((anns ?? []) as Ann[]);
      setMatches((ms ?? []) as Match[]);

      const s = stu as { id: string; batch_id: string | null; monthly_fee: number | null } | null;
      if (s) {
        const [{ data: att }, { data: perf }, { data: pays }, { data: b }, { data: unread }] = await Promise.all([
          supabase.from("attendance").select("status").eq("student_id", s.id).limit(200),
          supabase.from("performance_notes").select("rating").eq("student_id", s.id),
          supabase.from("fee_payments").select("fee_month").eq("student_id", s.id),
          s.batch_id ? supabase.from("batch_schedules").select("batch_name,days,start_time,end_time,location").eq("id", s.batch_id).maybeSingle() : Promise.resolve({ data: null }),
          supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_student_id", s.id).is("read_at", null),
        ]);
        const arows = (att ?? []) as { status: string }[];
        if (arows.length) {
          const p = arows.filter((r) => r.status === "present").length;
          setAttendancePct(Math.round((p / arows.length) * 100));
        }
        const prows = (perf ?? []) as { rating: number | null }[];
        if (prows.length) setAvgRating((prows.reduce((a, r) => a + (r.rating ?? 0), 0) / prows.length).toFixed(1));
        const month = new Date().toISOString().slice(0, 7);
        const paid = ((pays ?? []) as { fee_month: string }[]).some((p) => p.fee_month.slice(0, 7) === month);
        setFeeStatus(paid ? "Paid" : "Pending");
        setBatch(b as Batch);
        setUnreadMessages((unread as unknown as { count?: number })?.count ?? 0);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <div>
      <PageHeader eyebrow="[ Dashboard ]" title={`Hi, ${fullName || "there"}`} />
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Stat label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "—"} />
            <Stat label="Avg Rating" value={avgRating} suffix="★" />
            <Stat label="This Month's Fee" value={feeStatus} />
            <Stat label="Unread Messages" value={unreadMessages} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Next Training" link={{ to: "/portal/schedule", label: "View schedule →" }}>
              {batch ? (
                <>
                  <div className="font-display text-2xl">{batch.batch_name}</div>
                  <div className="text-sm text-muted-foreground">{batch.days}</div>
                  <div className="text-sm">{batch.start_time.slice(0, 5)} – {batch.end_time.slice(0, 5)}</div>
                  {batch.location && <div className="text-xs text-muted-foreground mt-1">{batch.location}</div>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No batch assigned yet.</p>
              )}
            </Card>

            <Card title="Upcoming Matches" link={{ to: "/portal/matches", label: "All matches →" }}>
              {matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming matches.</p>
              ) : (
                <ul className="space-y-2">
                  {matches.map((m) => (
                    <li key={m.id} className="text-sm">
                      <div className="font-semibold">{m.title}{m.opponent ? ` vs ${m.opponent}` : ""}</div>
                      <div className="text-xs text-muted-foreground">{m.match_date}{m.start_time ? ` · ${m.start_time.slice(0, 5)}` : ""}{m.location ? ` · ${m.location}` : ""}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Announcements" link={{ to: "/portal/messages", label: "All →" }}>
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              ) : (
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id}>
                      <div className="text-sm font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{a.body}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Quick Links">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono uppercase tracking-widest">
                <QL to="/portal/profile" label="Profile" />
                <QL to="/portal/attendance" label="Attendance" />
                <QL to="/portal/performance" label="Performance" />
                <QL to="/portal/fees" label="Fees" />
                <QL to="/portal/resources" label="Resources" />
                <QL to="/portal/achievements" label="Achievements" />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="border border-border p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">{label}</div>
      <div className="font-display text-3xl">{value}{suffix && <span className="text-primary text-xl ml-1">{suffix}</span>}</div>
    </div>
  );
}

function Card({ title, link, children }: { title: string; link?: { to: string; label: string }; children: React.ReactNode }) {
  return (
    <div className="border border-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xl">{title}</h3>
        {link && <Link to={link.to} className="text-xs font-mono uppercase tracking-widest text-primary hover:underline">{link.label}</Link>}
      </div>
      {children}
    </div>
  );
}

function QL({ to, label }: { to: string; label: string }) {
  return <Link to={to} className="border border-border px-3 py-2 hover:bg-foreground hover:text-background text-center">{label}</Link>;
}
