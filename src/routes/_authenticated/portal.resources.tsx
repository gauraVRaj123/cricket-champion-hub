import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/resources")({
  component: Resources,
});

type Resource = {
  id: string;
  title: string;
  description: string | null;
  kind: string;
  url: string;
  created_at: string;
};

const KIND_LABEL: Record<string, string> = {
  video: "Training Video",
  drill: "Practice Drill",
  rules: "Cricket Rules",
  article: "Article",
};

function Resources() {
  const [rows, setRows] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });
      setRows((data ?? []) as Resource[]);
      setLoading(false);
    })();
  }, []);

  const filtered =
    filter === "all" ? rows : rows.filter((r) => r.kind === filter);

  return (
    <div>
      <PageHeader eyebrow="[ Learning ]" title="Resources" />
      <div className="flex flex-wrap gap-2 mb-6">
        {["all", "video", "drill", "rules", "article"].map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border ${filter === k ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
          >
            {k === "all" ? "All" : KIND_LABEL[k]}
          </button>
        ))}
      </div>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && filtered.length === 0 && (
        <p className="text-sm text-muted-foreground">No resources here yet.</p>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="border border-border p-5 hover:border-primary transition-colors block"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
              {KIND_LABEL[r.kind] ?? r.kind}
            </div>
            <div className="font-display text-xl mb-1">{r.title}</div>
            {r.description && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {r.description}
              </p>
            )}
            <div className="text-xs underline mt-3">Open →</div>
          </a>
        ))}
      </div>
    </div>
  );
}
