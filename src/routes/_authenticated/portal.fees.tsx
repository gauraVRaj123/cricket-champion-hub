import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/fees")({
  component: MyFees,
});

type Payment = { id: string; amount: number; fee_month: string; paid_on: string; method: string | null; notes: string | null };

function MyFees() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase.from("students").select("id,monthly_fee").eq("user_id", uid).maybeSingle();
      if (!s) { setLoading(false); return; }
      setMonthlyFee(Number((s as { monthly_fee: number | null }).monthly_fee ?? 0));
      const { data } = await supabase.from("fee_payments").select("*").eq("student_id", (s as { id: string }).id).order("paid_on", { ascending: false });
      setPayments((data ?? []) as Payment[]);
      setLoading(false);
    })();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const paidThisMonth = payments.some((p) => p.fee_month.slice(0, 7) === currentMonth);
  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <PageHeader eyebrow="[ Fees ]" title="Fee History" />
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!loading && (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <div className="border border-border p-4"><div className="text-xs font-mono uppercase text-primary">Monthly Fee</div><div className="font-display text-3xl">₹{monthlyFee}</div></div>
            <div className="border border-border p-4"><div className="text-xs font-mono uppercase text-primary">This Month</div><div className="font-display text-3xl">{paidThisMonth ? "Paid" : "Pending"}</div></div>
            <div className="border border-border p-4"><div className="text-xs font-mono uppercase text-primary">Total Paid</div><div className="font-display text-3xl">₹{total}</div></div>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {payments.map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <div>
                    <div>For {p.fee_month.slice(0, 7)}</div>
                    <div className="text-xs text-muted-foreground">{p.paid_on} · {p.method}</div>
                  </div>
                  <div className="font-mono">₹{p.amount}</div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
