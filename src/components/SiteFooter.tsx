import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-3xl text-primary">STUMP&amp;STRIDE</div>
          <p className="mt-4 max-w-sm text-sm text-background/60">
            Mumbai's most rigorous cricket academy. Forging state and national
            players since 2008.
          </p>
          <div className="mt-6 font-mono text-[11px] text-background/40 leading-relaxed">
            Andheri Sports Complex, Veera Desai Rd
            <br />
            Mumbai 400053 · +91 98xxx 43210
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/40 mb-4">
            Academy
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/programs" className="hover:text-primary">Programs</Link></li>
            <li><Link to="/coaches" className="hover:text-primary">Coaches</Link></li>
            <li><Link to="/achievements" className="hover:text-primary">Achievements</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/40 mb-4">
            Get in
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/admissions" className="hover:text-primary">Admissions</Link></li>
            <li><Link to="/gallery" className="hover:text-primary">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
            <li><a href="#student-portal" className="hover:text-primary">Student Portal</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between gap-3 text-[11px] font-mono text-background/40">
          <div>© {new Date().getFullYear()} STUMP&amp;STRIDE ACADEMY · MUMBAI</div>
          <div>UPI · RAZORPAY · SECURE PAYMENTS</div>
        </div>
      </div>
    </footer>
  );
}