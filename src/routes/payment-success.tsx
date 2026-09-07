import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useDummyAuth } from "@/hooks/useDummyAuth";
import { findOrCreateStudent } from "@/lib/enrollments";

export const Route = createFileRoute("/payment-success")({
  validateSearch: (search: Record<string, unknown>) => ({
    batch_id: typeof search.batch_id === "string" ? search.batch_id : "",
  }),
  head: () => ({
    meta: [
      { title: "Payment Successful · Stump & Stride" },
      {
        name: "description",
        content: "Your batch enrollment payment is confirmed.",
      },
      { property: "og:title", content: "Payment Successful · Stump & Stride" },
      {
        property: "og:description",
        content: "Your batch enrollment payment is confirmed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentSuccess,
});

function PaymentSuccess() {
  const { batch_id } = Route.useSearch();
  const { user } = useDummyAuth();
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [batchName, setBatchName] = useState("");

  useEffect(() => {
    (async () => {
      if (!batch_id) return setState("error");
      const student = await findOrCreateStudent(user?.email, user?.full_name);
      if (!student) return setState("error");
      const { error } = await supabase
        .from("batch_enrollments")
        .update({ payment_status: "paid" })
        .eq("batch_id", batch_id)
        .eq("student_id", student.id);
      const { data: batch } = await supabase
        .from("batch_schedules")
        .select("batch_name")
        .eq("id", batch_id)
        .maybeSingle();
      setBatchName(batch?.batch_name ?? "");
      setState(error ? "error" : "done");
    })();
  }, [batch_id, user?.email, user?.full_name]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary">
        [ Payment ]
      </div>
      <h1 className="font-display text-4xl md:text-5xl mt-2 mb-4">
        {state === "working"
          ? "Confirming your payment…"
          : state === "done"
            ? "Payment Successful"
            : "We couldn't confirm this payment"}
      </h1>
      <p className="text-muted-foreground mb-8">
        {state === "done"
          ? `Your seat${batchName ? ` in ${batchName}` : ""} is confirmed. See you at the nets!`
          : state === "error"
            ? "Please try joining the batch again, or contact us for help."
            : "Hang tight for a moment."}
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild>
          <Link to="/portal/batches">Back to Batches</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/portal">My Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
