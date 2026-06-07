export type Batch = {
  id: string;
  batch_name: string;
  age_group: string;
  days: string;
  start_time: string;
  end_time: string;
  location: string;
};

export type Student = {
  id: string;
  name: string;
  age: number;
  parent_name: string;
  phone: string;
  batch_id: string;
  playing_role: string;
};

export type Match = {
  id: string;
  title: string;
  opponent: string;
  match_date: string;
  start_time: string;
  location: string;
  format: string;
  status: "upcoming" | "completed";
  result?: string;
};

export type PerfNote = {
  id: string;
  student_id: string;
  rating: number;
  remarks: string;
  created_at: string;
};

export const BATCHES: Batch[] = [
  { id: "b1", batch_name: "U-16 Talent Track", age_group: "U-16", days: "Tue · Thu", start_time: "17:00", end_time: "19:00", location: "Academy Oval" },
  { id: "b2", batch_name: "Power Hitting", age_group: "U-12", days: "Mon · Wed · Fri", start_time: "16:00", end_time: "18:00", location: "Wankhede Training Ground" },
];

export const STUDENTS: Student[] = [
  { id: "s1", name: "Arjun Mehta", age: 14, parent_name: "Ravi Mehta", phone: "9000010001", batch_id: "b1", playing_role: "Batsman" },
  { id: "s2", name: "Kabir Shah", age: 15, parent_name: "Neha Shah", phone: "9000010002", batch_id: "b1", playing_role: "All-rounder" },
  { id: "s3", name: "Rohan Iyer", age: 13, parent_name: "Suresh Iyer", phone: "9000010003", batch_id: "b1", playing_role: "Bowler" },
  { id: "s4", name: "Vivaan Kapoor", age: 11, parent_name: "Anita Kapoor", phone: "9000010004", batch_id: "b2", playing_role: "Wicket Keeper" },
  { id: "s5", name: "Ishaan Reddy", age: 10, parent_name: "Pradeep Reddy", phone: "9000010005", batch_id: "b2", playing_role: "Batsman" },
];

export const MATCHES: Match[] = [
  { id: "m1", title: "Practice Match vs Crescent CC", opponent: "Crescent CC", match_date: "2026-06-14", start_time: "09:00", location: "Academy Oval", format: "T20", status: "upcoming" },
  { id: "m2", title: "Friendly vs Marine Lines XI", opponent: "Marine Lines XI", match_date: "2026-05-22", start_time: "09:00", location: "Cross Maidan", format: "T20", status: "completed", result: "Won by 24 runs" },
];