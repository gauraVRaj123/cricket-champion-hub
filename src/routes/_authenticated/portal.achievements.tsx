import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/achievements")({
  component: Achievements,
});

type Row = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  awarded_on: string;
  file_url: string | null;
};
const KIND_LABEL: Record<string, string> = {
  certificate: "Certificate",
  award: "Award",
  tournament: "Tournament",
};

function Achievements() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      const studentId = (s as { id: string } | null)?.id;
      if (!studentId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", studentId)
        .order("awarded_on", { ascending: false });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      <PageHeader eyebrow="[ Achievements ]" title="My Achievements" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && rows.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No achievements recorded yet.
        </p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((r) => (
          <div key={r.id} className="border border-border p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
              {KIND_LABEL[r.kind] ?? r.kind}
            </div>
            <div className="font-display text-xl mb-1">{r.title}</div>
            <div className="text-xs text-muted-foreground mb-2">
              {r.awarded_on}
            </div>
            {r.description && <p className="text-sm mb-3">{r.description}</p>}
            {r.file_url && (
              <a
                href={r.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline text-primary"
              >
                View certificate →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
