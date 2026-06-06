import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { useDummyAuth } from "@/hooks/useDummyAuth";
import { PageHeader } from "@/components/DashboardShell";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: StudentDashboard,
});

type Ann = { id: string; title: string; body: string; created_at: string };

type Match = {
  id: string;
  title: string;
  opponent: string | null;
  match_date: string;
  start_time: string | null;
  location: string | null;
};

type Batch = {
  batch_name: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string | null;
};

const DUMMY = {
  announcements: [
    {
      id: "ann1",
      title: "New season trials",
      body: "Tryouts start this weekend. Bring your gear and arrive 20 minutes early.",
      created_at: new Date().toISOString(),
    },
    {
      id: "ann2",
      title: "Weekend coaching",
      body: "Extra batting session added for students—limited slots available.",
      created_at: new Date().toISOString(),
    },
    {
      id: "ann3",
      title: "Match day update",
      body: "Check schedule for venue and timings. Attendance is mandatory.",
      created_at: new Date().toISOString(),
    },
  ] satisfies Ann[],

  studentDashboard: {
    attendancePct: 86,
    avgRating: "4.6",
    feeStatus: "Paid" as "Paid" | "Pending" | "—",
    batch: {
      batch_name: "U-14 Fast Track",
      days: "Mon · Wed · Fri",
      start_time: "16:00",
      end_time: "18:00",
      location: "Wankhede Stadium Training Ground",
    } satisfies Batch,
    matches: [
      {
        id: "m1",
        title: "Quarter Final",
        opponent: "Mumbai Strikers",
        match_date: new Date().toISOString().slice(0, 10),
        start_time: "10:30",
        location: "Dr. Ambedkar Sports Complex",
      },
      {
        id: "m2",
        title: "League Match",
        opponent: "Thane Titans",
        match_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        start_time: "12:00",
        location: "Academy Oval",
      },
    ] satisfies Match[],
    unreadMessages: 2,
  },
};

function StudentDashboard() {
  const { user } = useDummyAuth();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");

  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<string>("—");
  const [feeStatus, setFeeStatus] = useState<"Paid" | "Pending" | "—">("—");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [announcements, setAnnouncements] = useState<Ann[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const greetingName = useMemo(() => {
    return user?.full_name || user?.email?.split("@")[0] || "there";
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Local dummy data: no Supabase calls.
    setFullName(greetingName);
    setAttendancePct(DUMMY.studentDashboard.attendancePct);
    setAvgRating(DUMMY.studentDashboard.avgRating);
    setFeeStatus(DUMMY.studentDashboard.feeStatus);
    setBatch(DUMMY.studentDashboard.batch);
    setAnnouncements(DUMMY.announcements);
    setMatches(DUMMY.studentDashboard.matches);
    setUnreadMessages(DUMMY.studentDashboard.unreadMessages);
    setLoading(false);
  }, [user, greetingName]);

  return (
    <div>
      <PageHeader eyebrow="[ Dashboard ]" title={`Hi, ${fullName || "there"}`} />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Stat label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "—"} />
            <Stat label="Avg Rating" value={avgRating} suffix="★" />
            <Stat label="This Month's Fee" value={feeStatus} />
            <Stat label="Unread Messages" value={unreadMessages} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Next Training" link={{ to: "/portal/schedule", label: "View schedule →" }}>
              {batch ? (
                <>
                  <div className="font-display text-2xl">{batch.batch_name}</div>
                  <div className="text-sm text-muted-foreground">{batch.days}</div>
                  <div className="text-sm">
                    {batch.start_time} – {batch.end_time}
                  </div>
                  {batch.location && (
                    <div className="text-xs text-muted-foreground mt-1">{batch.location}</div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No batch assigned yet.</p>
              )}
            </Card>

            <Card title="Upcoming Matches" link={{ to: "/portal/matches", label: "All matches →" }}>
              {matches.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming matches.</p>
              ) : (
                <ul className="space-y-2">
                  {matches.map((m) => (
                    <li key={m.id} className="text-sm">
                      <div className="font-semibold">
                        {m.title}
                        {m.opponent ? ` vs ${m.opponent}` : ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.match_date}
                        {m.start_time ? ` · ${m.start_time}` : ""}
                        {m.location ? ` · ${m.location}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Announcements" link={{ to: "/portal/messages", label: "All →" }}>
              {announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              ) : (
                <ul className="space-y-3">
                  {announcements.map((a) => (
                    <li key={a.id}>
                      <div className="text-sm font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{a.body}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card title="Quick Links">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono uppercase tracking-widest">
                <QL to="/portal/profile" label="Profile" />
                <QL to="/portal/attendance" label="Attendance" />
                <QL to="/portal/performance" label="Performance" />
                <QL to="/portal/fees" label="Fees" />
                <QL to="/portal/resources" label="Resources" />
                <QL to="/portal/achievements" label="Achievements" />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="border border-border p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary mb-2">
        {label}
      </div>
      <div className="font-display text-3xl">
        {value}
        {suffix && <span className="text-primary text-xl ml-1">{suffix}</span>}
      </div>
    </div>
  );
}

function Card({
  title,
  link,
  children,
}: {
  title: string;
  link?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-display text-xl">{title}</h3>
        {link && (
          <Link
            to={link.to}
            className="text-xs font-mono uppercase tracking-widest text-primary hover:underline"
          >
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function QL({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="border border-border px-3 py-2 hover:bg-foreground hover:text-background text-center"
    >
      {label}
    </Link>
  );
}
