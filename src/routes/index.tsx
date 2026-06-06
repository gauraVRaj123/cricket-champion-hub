import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import heroBatter from "@/assets/hero-batter.jpg";
import bowler from "@/assets/bowler.jpg";
import coaching from "@/assets/coaching.jpg";
import grounds from "@/assets/academy-grounds.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stump & Stride Cricket Academy · Train Like a Champion" },
      {
        name: "description",
        content:
          "Mumbai's elite cricket academy. Book a free trial, view batch schedules and meet the coaches forging India's next state and national players.",
      },
      { property: "og:title", content: "Stump & Stride Cricket Academy" },
      {
        property: "og:description",
        content:
          "Train like a champion. Free trials, expert coaching, proven results.",
      },
      { property: "og:image", content: heroBatter },
      { name: "twitter:image", content: heroBatter },
    ],
  }),
  component: Index,
});

const fallbackBatches = [
  {
    tag: "Morning Elite",
    time: "06:00 — 09:00",
    meta: "Mon · Wed · Fri · U-14, U-16, U-19",
    price: "₹ 3,500",
    dark: false,
  },
  {
    tag: "Evening Grind",
    time: "16:00 — 19:00",
    meta: "Daily · Open Age & Professional",
    price: "₹ 4,200",
    dark: false,
  },
  {
    tag: "Weekend Warrior",
    time: "Sat & Sun",
    meta: "All Ages · Skills Focused",
    price: "₹ 2,500",
    dark: true,
  },
];

const alumni = [
  { name: "Rohan Verma", honor: "Ranji Trophy · Mumbai", year: "2024" },
  { name: "Aditya Shetty", honor: "U-19 India A", year: "2023" },
  { name: "Sahil Khan", honor: "IPL Net Bowler · MI", year: "2024" },
  { name: "Krish Patil", honor: "West Zone U-16", year: "2022" },
];

const testimonials = [
  {
    quote:
      "Aarav's technique changed in three months. The coaches don't sugar-coat anything — they teach you to compete.",
    parent: "Meera Iyer",
    of: "Parent · U-14 batter",
  },
  {
    quote:
      "The video analysis sessions are professional grade. We finally understood what was going wrong with his run-up.",
    parent: "Rajiv Khanna",
    of: "Parent · U-16 pace bowler",
  },
  {
    quote:
      "Worth every rupee. The discipline carries over to school, to fitness, to everything.",
    parent: "Anjali Deshmukh",
    of: "Parent · U-12 all-rounder",
  },
];

function Index() {
  const [batches, setBatches] = useState(fallbackBatches);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("batch_schedules")
        .select(
          "batch_name, age_group, days, start_time, end_time, notes, display_order",
        )
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (data && data.length > 0) {
        setBatches(
          data.map((b, i) => ({
            tag: b.batch_name,
            time: `${b.start_time.slice(0, 5)} — ${b.end_time.slice(0, 5)}`,
            meta: `${b.days} · ${b.age_group}`,
            price: b.notes || "",
            dark: i % 3 === 2,
          })),
        );
      }
    })();
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-28 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7 animate-reveal">
            <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold tracking-[0.25em] uppercase mb-6">
              Elite Cricket Academy / Mumbai
            </div>
            <h1 className="font-display text-7xl md:text-[10rem] leading-[0.85] text-balance mb-8">
              WHERE <span className="text-primary">CHAMPIONS</span>
              <br />
              ARE FORGED.
            </h1>
            <p className="max-w-[48ch] text-lg text-muted-foreground mb-8 text-pretty">
              Discipline is the baseline. Intensity is the requirement. Join
              Mumbai's most rigorous training program for aspiring state and
              national players.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admissions"
                className="bg-foreground text-background px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-primary transition-all shadow-xl shadow-black/10"
              >
                Book a Free Trial
              </Link>
              <Link
                to="/programs"
                className="border-2 border-foreground px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-foreground hover:text-background transition-all"
              >
                View Batches
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 relative animate-reveal [animation-delay:200ms]">
            <img
              src={heroBatter}
              alt="Stump & Stride batter mid-drive in the academy nets"
              width={1200}
              height={1600}
              className="w-full aspect-[3/4] object-cover rounded-sm"
            />
            <div className="absolute -bottom-6 -left-6 bg-card p-6 border border-border shadow-2xl">
              <div className="font-mono text-xs text-primary mb-1">
                ALUMNI STATUS
              </div>
              <div className="font-display text-3xl">12+ PRO DEBUTS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Last 24 Months
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-[2px] bg-primary/20 animate-line" />
      </section>

      {/* STATS STRIP */}
      <section className="bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            ["450+", "Active Students"],
            ["12", "State Players"],
            ["03", "Ranji Graduates"],
            ["08", "Turf Pitches"],
          ].map(([n, l]) => (
            <div key={l}>
              <div className="font-display text-5xl text-primary">{n}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] mt-2 text-background/60">
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BATCH SCHEDULES */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <h2 className="font-display text-5xl md:text-6xl">
              Batch Schedules
            </h2>
            <span className="font-mono text-sm text-muted-foreground">
              [ SEASON_25/26 ]
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {batches.map((b) => (
              <div
                key={b.tag}
                className={
                  (b.dark
                    ? "bg-foreground text-background "
                    : "bg-background text-foreground ") +
                  "p-8 group hover:bg-primary hover:text-primary-foreground transition-colors"
                }
              >
                <div className="text-primary group-hover:text-primary-foreground font-bold text-xs uppercase tracking-widest mb-4">
                  {b.tag}
                </div>
                <div className="font-display text-4xl mb-2">{b.time}</div>
                <div className="text-xs font-semibold uppercase tracking-widest opacity-70">
                  {b.meta}
                </div>
                <div className="mt-10 pt-6 border-t border-current/20 flex justify-between items-center">
                  <span className="text-lg font-bold">
                    {b.price} <span className="text-xs opacity-60">/MO</span>
                  </span>
                  <Link
                    to="/admissions"
                    className="text-[10px] underline underline-offset-4 font-bold tracking-widest"
                  >
                    ENROLL →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <img
            src={bowler}
            alt="Fast bowler in mid-action"
            loading="lazy"
            width={1024}
            height={1280}
            className="w-full aspect-[4/5] object-cover rounded-sm"
          />
          <div>
            <div className="font-mono text-xs text-primary uppercase tracking-[0.25em] mb-4">
              [ 02 ] Performance Tracker
            </div>
            <h2 className="font-display text-5xl md:text-6xl mb-6">
              Every ball.
              <br />
              Every stat. <span className="text-primary">Tracked.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-prose mb-8">
              Our in-house tracker logs batting average, strike rate, bowling
              figures and fitness scores for every student. Parents log into the
              portal to follow progress between sessions.
            </p>
            <dl className="grid grid-cols-3 gap-4 mb-8">
              {[
                ["42.8", "Batting Avg"],
                ["18.2", "Bowl SR"],
                ["94", "Fitness"],
              ].map(([n, l]) => (
                <div key={l} className="border border-border p-4">
                  <dt className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
                    {l}
                  </dt>
                  <dd className="font-display text-3xl mt-1">{n}</dd>
                </div>
              ))}
            </dl>
            <a
              href="#student-portal"
              className="inline-block border-2 border-foreground px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
            >
              Open Student Portal →
            </a>
          </div>
        </div>
      </section>

      {/* ALUMNI */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <h2 className="font-display text-5xl md:text-6xl">
              Notable <span className="text-primary">Alumni</span>
            </h2>
            <Link
              to="/achievements"
              className="font-mono text-xs uppercase tracking-widest underline underline-offset-4"
            >
              All achievements →
            </Link>
          </div>
          <div className="grid md:grid-cols-4 gap-px bg-background/10">
            {alumni.map((a) => (
              <div key={a.name} className="bg-foreground p-6">
                <div className="font-mono text-[10px] text-primary uppercase tracking-widest">
                  {a.year}
                </div>
                <div className="font-display text-3xl mt-3">{a.name}</div>
                <div className="text-sm text-background/60 mt-1">{a.honor}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="font-mono text-xs text-primary uppercase tracking-[0.25em] mb-4">
            [ 04 ] What Parents Say
          </div>
          <h2 className="font-display text-5xl md:text-6xl mb-12 max-w-3xl">
            Honest training. Honest results.
          </h2>
          <div className="grid md:grid-cols-3 gap-px bg-border">
            {testimonials.map((t) => (
              <figure key={t.parent} className="bg-card p-8">
                <blockquote className="text-lg leading-snug text-pretty">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 pt-6 border-t border-border">
                  <div className="font-bold">{t.parent}</div>
                  <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest mt-1">
                    {t.of}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img
          src={grounds}
          alt="Academy grounds at golden hour"
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <h2 className="font-display text-6xl md:text-8xl leading-[0.9] text-balance">
            Your first session is <span className="text-primary">on us.</span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-muted-foreground text-lg">
            Block a trial slot in 60 seconds. No fee, no commitment — just bring
            your kit.
          </p>
          <Link
            to="/admissions"
            className="inline-block mt-10 bg-primary text-primary-foreground px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-foreground transition-all"
          >
            Book a Free Trial
          </Link>
        </div>
      </section>
    </>
  );
}
