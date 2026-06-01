import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIsCoach } from "@/hooks/useIsAdmin";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "Coach Dashboard · Stump & Stride" }] }),
  component: CoachPage,
});

type Coach = {
  id: string;
  name: string;
  role: string;
  certifications: string | null;
  experience_years: number | null;
  bio: string | null;
};

type Schedule = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
  notes: string | null;
  active: boolean;
};

function CoachPage() {
  const { isCoach, checking } = useIsCoach();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCoach) return;
    (async () => {
      setLoading(true);
      const { data: c } = await supabase
        .from("coaches")
        .select("*")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
        .maybeSingle();
      setCoach(c as Coach | null);
      if (c) {
        const { data: s } = await supabase
          .from("batch_schedules")
          .select("*")
          .eq("coach_id", c.id)
          .order("display_order", { ascending: true });
        setSchedules((s as Schedule[]) ?? []);
      }
      setLoading(false);
    })();
  }, [isCoach]);

  if (checking) {
    return (
      <div className="py-32 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isCoach) {
    return (
      <div className="max-w-2xl mx-auto py-32 px-6 text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
          [ 403 ]
        </div>
        <h1 className="font-display text-5xl mb-4">Coaches only</h1>
        <p className="text-muted-foreground">
          Your account doesn't have a coach role. Ask the academy admin to grant access.
        </p>
        <Link to="/portal" className="inline-block mt-8 font-mono text-xs underline underline-offset-4">
          ← Back to portal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">[ COACH ]</div>
      <h1 className="font-display text-5xl mt-2 mb-2">
        {coach ? coach.name : "Coach Dashboard"}
      </h1>
      {coach && (
        <p className="text-sm text-muted-foreground mb-10">
          {coach.role}{coach.certifications ? ` · ${coach.certifications}` : ""}
          {coach.experience_years ? ` · ${coach.experience_years}y experience` : ""}
        </p>
      )}

      {!coach && !loading && (
        <div className="border border-border p-6 text-sm text-muted-foreground">
          Your account has the coach role but isn't linked to a coach profile yet.
          Ask the admin to set <span className="font-mono">user_id</span> on your coach record.
        </div>
      )}

      {coach && (
        <section>
          <h2 className="font-display text-2xl mb-4">My Batches ({schedules.length})</h2>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && schedules.length === 0 && (
            <p className="text-sm text-muted-foreground">No batches assigned yet.</p>
          )}
          <div className="space-y-3">
            {schedules.map((s) => (
              <div key={s.id} className="border border-border p-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
                  {s.age_group} {!s.active && "· HIDDEN"}
                </div>
                <div className="font-display text-xl mt-1">{s.batch_name}</div>
                <div className="text-xs">
                  {s.days} · {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                </div>
                {s.location && <div className="text-xs text-muted-foreground">{s.location}</div>}
                {s.notes && <div className="text-xs mt-1">{s.notes}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}