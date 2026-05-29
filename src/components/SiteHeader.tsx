import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const nav = [
  { to: "/programs", label: "Programs" },
  { to: "/coaches", label: "Coaches" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/achievements", label: "Achievements" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-3xl tracking-tighter text-primary">
          STUMP&amp;STRIDE
        </Link>
        <div className="hidden md:flex gap-7 text-xs font-semibold uppercase tracking-[0.18em]">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex font-mono text-[11px] border border-primary text-primary px-3 py-1.5 rounded hover:bg-primary hover:text-primary-foreground transition-all"
            >
              ADMIN
            </Link>
          )}
          <Link
            to={user ? "/portal" : "/auth"}
            className="hidden sm:inline-flex font-mono text-[11px] border border-border px-3 py-1.5 rounded hover:bg-foreground hover:text-background transition-all"
          >
            {user ? "STUDENT_PORTAL" : "SIGN_IN"}
          </Link>
          <Link
            to="/admissions"
            className="bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-foreground transition-colors"
          >
            Book Trial
          </Link>
        </div>
      </div>
    </nav>
  );
}