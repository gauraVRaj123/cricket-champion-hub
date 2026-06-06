import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: UsersAdmin,
});

type Role = "admin" | "coach" | "student";
type UserRow = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  roles: Role[];
};

function UsersAdmin() {
  const [list, setList] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, email, phone")
        .order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const byUser = new Map<string, Role[]>();
    (roles ?? []).forEach((r: { user_id: string; role: Role }) => {
      const arr = byUser.get(r.user_id) ?? [];
      arr.push(r.role);
      byUser.set(r.user_id, arr);
    });
    const rows: UserRow[] = (profiles ?? []).map(
      (p: {
        id: string;
        full_name: string;
        email: string | null;
        phone: string | null;
      }) => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        phone: p.phone,
        roles: byUser.get(p.id) ?? [],
      }),
    );
    setList(rows);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grant = async (user_id: string, role: Role) => {
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id, role });
    if (error) return toast.error(error.message);
    toast.success(`Granted ${role}`);
    load();
  };

  const revoke = async (user_id: string, role: Role) => {
    if (!confirm(`Remove ${role} from this user?`)) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", user_id)
      .eq("role", role);
    if (error) return toast.error(error.message);
    toast.success(`Revoked ${role}`);
    load();
  };

  const filtered = list.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader eyebrow="[ Users ]" title="Users & Roles" />
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <p className="text-xs text-muted-foreground">
          Copy a user ID below to link it to a coach or student record.
        </p>
        <Input
          placeholder="Search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="space-y-2">
        {filtered.map((u) => {
          const roles: Role[] = ["student", "coach", "admin"];
          return (
            <div key={u.id} className="border border-border p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="font-display text-lg">
                    {u.full_name || "(no name)"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </div>
                  {u.phone && (
                    <div className="text-xs text-muted-foreground">
                      {u.phone}
                    </div>
                  )}
                  <div className="font-mono text-[10px] text-muted-foreground mt-1 break-all">
                    {u.id}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => {
                    const has = u.roles.includes(r);
                    return (
                      <Button
                        key={r}
                        size="sm"
                        variant={has ? "default" : "outline"}
                        onClick={() => (has ? revoke(u.id, r) : grant(u.id, r))}
                      >
                        {has ? `✓ ${r}` : `+ ${r}`}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
