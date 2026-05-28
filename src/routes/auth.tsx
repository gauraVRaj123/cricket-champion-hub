import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · Stump & Stride" },
      { name: "description", content: "Sign in or create your student account." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().trim().min(7).max(20),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/portal", replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      if (mode === "signup") {
        const parsed = signupSchema.parse({
          full_name: fd.get("full_name"),
          email: fd.get("email"),
          password: fd.get("password"),
          phone: fd.get("phone"),
        });
        const { error } = await supabase.auth.signUp({
          email: parsed.email,
          password: parsed.password,
          options: {
            emailRedirectTo: `${window.location.origin}/portal`,
            data: { full_name: parsed.full_name, phone: parsed.phone },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome!");
      } else {
        const parsed = loginSchema.parse({
          email: fd.get("email"),
          password: fd.get("password"),
        });
        const { error } = await supabase.auth.signInWithPassword(parsed);
        if (error) throw error;
        toast.success("Signed in");
      }
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/portal`,
    });
    if (res.error) {
      toast.error(res.error.message ?? "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <section className="py-24">
      <div className="max-w-md mx-auto px-6">
        <div className="font-mono text-xs text-primary uppercase tracking-widest mb-3">
          [ Student Portal ]
        </div>
        <h1 className="font-display text-5xl tracking-tighter mb-8">
          {mode === "signin" ? "Welcome back." : "Create your account."}
        </h1>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full border border-border px-4 py-3 text-sm font-semibold hover:bg-foreground hover:text-background transition-colors mb-6"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> or email <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Field label="Full name" name="full_name" required />
              <Field label="Phone (WhatsApp)" name="phone" required />
            </>
          )}
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required minLength={mode === "signup" ? 8 : 1} />
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-primary-foreground px-6 py-4 font-bold uppercase tracking-widest text-sm hover:bg-foreground transition-colors disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-sm text-muted-foreground">
          {mode === "signin" ? "New here?" : "Already registered?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary font-semibold hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">← Back to home</Link>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        minLength={minLength}
        maxLength={255}
        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}