import { type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export type NavItem = {
  to: string;
  label: string;
};

export function DashboardShell({
  role,
  title,
  items,
  children,
}: {
  role: "ADMIN" | "COACH" | "STUDENT";
  title: string;
  items: NavItem[];
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-[calc(100vh-5rem)] grid md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-card/40 p-6 md:sticky md:top-20 md:h-[calc(100vh-5rem)] md:overflow-y-auto">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-1">
          [ {role} ]
        </div>
        <h2 className="font-display text-2xl mb-6 leading-tight">{title}</h2>
        <nav className="flex md:flex-col gap-1 flex-wrap">
          {items.map((it) => {
            const active =
              it.to === pathname ||
              (it.to !== "/admin" && it.to !== "/coach" && it.to !== "/portal" &&
                pathname.startsWith(it.to));
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`block px-3 py-2 text-xs font-mono uppercase tracking-[0.2em] border ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "border-transparent hover:border-border text-foreground/80 hover:text-foreground"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8 pt-6 border-t border-border text-[10px] font-mono text-muted-foreground break-all">
          {user?.email}
        </div>
        <button
          onClick={() => signOut()}
          className="mt-3 w-full font-mono text-[11px] border border-border px-3 py-1.5 rounded hover:bg-foreground hover:text-background transition-all"
        >
          SIGN_OUT
        </button>
      </aside>
      <main className="p-6 md:p-10 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-4xl">{title}</h1>
      </div>
      {children && <div className="flex gap-2">{children}</div>}
    </div>
  );
}

export function Forbidden({
  role,
  links,
}: {
  role: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div className="max-w-2xl mx-auto py-32 px-6 text-center">
      <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
        [ 403 ]
      </div>
      <h1 className="font-display text-5xl mb-4">{role} only</h1>
      <p className="text-muted-foreground">
        Your account doesn't have this role. Ask the academy admin to grant access.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4 font-mono text-xs">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="underline underline-offset-4">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Checking() {
  return (
    <div className="py-32 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
      Checking access…
    </div>
  );
}