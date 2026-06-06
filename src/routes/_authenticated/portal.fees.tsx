import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/DashboardShell";
import jsPDF from "jspdf";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/fees")({
  component: MyFees,
});

type Payment = { id: string; amount: number; fee_month: string; paid_on: string; method: string | null; notes: string | null };

function MyFees() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [monthlyFee, setMonthlyFee] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = (await supabase.auth.getUser()).data.user?.id ?? "";
      const { data: s } = await supabase.from("students").select("id,name,monthly_fee").eq("user_id", uid).maybeSingle();
      if (!s) { setLoading(false); return; }
      const stu = s as { id: string; name: string; monthly_fee: number | null };
      setMonthlyFee(Number(stu.monthly_fee ?? 0));
      setStudentName(stu.name);
      const { data } = await supabase.from("fee_payments").select("*").eq("student_id", stu.id).order("paid_on", { ascending: false });
      setPayments((data ?? []) as Payment[]);
      setLoading(false);
    })();
  }, []);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const paidThisMonth = payments.some((p) => p.fee_month.slice(0, 7) === currentMonth);
  const total = payments.reduce((s, p) => s + Number(p.amount), 0);

  function downloadReceipt(p: Payment) {
    try {
      const doc = new jsPDF({ unit: "pt", format: "a5" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Stump & Stride Cricket Academy", 30, 50);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Fee Payment Receipt", 30, 70);
      doc.line(30, 80, 390, 80);

      const rows: [string, string][] = [
        ["Receipt No.", p.id.slice(0, 8).toUpperCase()],
        ["Student", studentName],
        ["For Month", p.fee_month.slice(0, 7)],
        ["Paid On", p.paid_on],
        ["Method", (p.method ?? "cash").toUpperCase()],
        ["Amount", `INR ${Number(p.amount).toLocaleString("en-IN")}`],
      ];
      let y = 110;
      doc.setFontSize(11);
      rows.forEach(([k, v]) => {
        doc.setFont("helvetica", "bold");
        doc.text(k, 30, y);
        doc.setFont("helvetica", "normal");
        doc.text(v, 160, y);
        y += 22;
      });
      if (p.notes) {
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.text("Notes", 30, y);
        doc.setFont("helvetica", "normal");
        doc.text(doc.splitTextToSize(p.notes, 220) as string[], 160, y);
      }
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text("This is a system-generated receipt.", 30, 540);
      doc.save(`receipt-${p.fee_month.slice(0, 7)}-${p.id.slice(0, 6)}.pdf`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

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
                <li key={p.id} className="py-3 flex justify-between items-center gap-3">
                  <div className="min-w-0">
                    <div>For {p.fee_month.slice(0, 7)}</div>
                    <div className="text-xs text-muted-foreground">{p.paid_on} · {p.method}</div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="font-mono">₹{p.amount}</div>
                    <button onClick={() => downloadReceipt(p)} className="text-xs font-mono uppercase tracking-widest border border-border px-3 py-1.5 hover:bg-foreground hover:text-background">Receipt</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
