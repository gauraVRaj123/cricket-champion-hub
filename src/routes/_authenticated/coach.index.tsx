import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageHeader } from "@/components/DashboardShell";
import { useDummyAuth } from "@/hooks/useDummyAuth";

export const Route = createFileRoute("/_authenticated/coach/")({
  component: CoachDashboard,
});

type Batch = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
};

type Coach = {
  name: string;
  role: string;
  certifications: string | null;
  experience_years: number | null;
};

const DUMMY_COACH: Coach = {
  name: "Coach Demo",
  role: "coach",
  certifications: "Level-2 · Fast Bowling",
  experience_years: 6,
};

const DUMMY_BATCHES: Batch[] = [
  {
    id: "b1",
    batch_name: "U-16 Talent Track",
    age_group: "U-16",
    days: "Tue · Thu",
    start_time: "17:00",
    end_time: "19:00",
    location: "Academy Oval",
  },
  {
    id: "b2",
    batch_name: "Power Hitting",
    age_group: "U-12",
    days: "Mon · Wed · Fri",
    start_time: "16:00",
    end_time: "18:00",
    location: "Wankhede Stadium Training Ground",
  },
];

function CoachDashboard() {
  const { user } = useDummyAuth();

  const name = useMemo(() => user?.full_name || DUMMY_COACH.name, [user]);

  return (
    <div>
      <PageHeader eyebrow="[ Coach ]" title={name} />
      <p className="text-sm text-muted-foreground mb-6">
        {DUMMY_COACH.role}
        {DUMMY_COACH.certifications ? ` · ${DUMMY_COACH.certifications}` : ""}
        {DUMMY_COACH.experience_years ? ` · ${DUMMY_COACH.experience_years}y experience` : ""}
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-border p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
            My Batches
          </div>
          <div className="font-display text-4xl">{DUMMY_BATCHES.length}</div>
        </div>

        <div className="border border-border p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
            Students
          </div>
          <div className="font-display text-4xl">24</div>
        </div>

        <div className="border border-border p-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
            Marked Today
          </div>
          <div className="font-display text-4xl">18</div>
        </div>
      </div>

      <h2 className="font-display text-2xl mb-3">My Batches</h2>
      <div className="space-y-3">
        {DUMMY_BATCHES.map((s) => (
          <div key={s.id} className="border border-border p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
              {s.age_group}
            </div>
            <div className="font-display text-xl">{s.batch_name}</div>
            <div className="text-xs">
              {s.days} · {s.start_time} – {s.end_time}
            </div>
            {s.location ? <div className="text-xs text-muted-foreground">{s.location}</div> : null}
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        <Link to="/coach/students" className="text-primary hover:underline inline-block">
          View student roster →
        </Link>
      </div>
    </div>
  );
}
