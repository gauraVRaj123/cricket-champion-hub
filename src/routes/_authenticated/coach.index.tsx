import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import {
  fetchCoachByUser,
  fetchCoachBatches,
  fetchPaidStudentsForBatches,
  fmtTime,
  type BatchFull,
} from "@/lib/enrollments";

export const Route = createFileRoute("/_authenticated/coach/")({
  component: CoachDashboard,
});

type CoachRecord = Awaited<ReturnType<typeof fetchCoachByUser>>;

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function runsToday(days: string) {
  const key = DAY_KEYS[new Date().getDay()];
  return days.toLowerCase().includes(key);
}

function CoachDashboard() {
  const { user } = useDummyAuth();
  const [coach, setCoach] = useState<CoachRecord>(null);
  const [batches, setBatches] = useState<BatchFull[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const c = await fetchCoachByUser(user?.id, user?.full_name);
      const list = c ? await fetchCoachBatches(c.id) : [];
      const roster = await fetchPaidStudentsForBatches(list.map((b) => b.id));
      const unique = new Set(roster.map((r) => r.students?.id).filter(Boolean));
      if (cancelled) return;
      setCoach(c);
      setBatches(list);
      setStudentCount(unique.size);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.full_name]);

  const todayCount = batches.filter((b) => runsToday(b.days)).length;

  return (
    <div>
      <PageHeader eyebrow="[ Coach ]" title={coach?.name || user?.full_name || "Coach"} />
      <p className="text-sm text-muted-foreground mb-6">
        {coach
          ? [
              coach.role,
              coach.certifications,
              coach.experience_years ? `${coach.experience_years}y experience` : null,
            ]
              .filter(Boolean)
              .join(" · ")
          : "No coach profile linked to your account yet."}
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "My Batches", value: batches.length },
          { label: "My Students", value: studentCount },
          { label: "Sessions Today", value: todayCount },
        ].map((s) => (
          <div key={s.label} className="border border-border p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
              {s.label}
            </div>
            <div className="font-display text-4xl">{loading ? "—" : s.value}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-2xl mb-3">My Batches</h2>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && batches.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No batches assigned to you yet. Ask an admin to assign you to a batch.
        </p>
      )}
      <div className="space-y-3">
        {batches.map((b) => (
          <Link
            key={b.id}
            to="/coach/students"
            search={{ batch_id: b.id }}
            className="block border border-border p-4 hover:border-primary transition-colors"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {b.age_group}
              {b.active ? "" : " · Hidden"}
            </div>
            <div className="font-display text-xl">{b.batch_name}</div>
            <div className="text-xs">
              {b.days} · {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
            </div>
            {b.location ? (
              <div className="text-xs text-muted-foreground">{b.location}</div>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
