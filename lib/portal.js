import { db } from "./supabase";

// Who can open the teacher view. Set TEACHER_EMAILS in hosting settings to change it (comma-separated).
export function teacherEmails() {
  return (process.env.TEACHER_EMAILS || "rainemusicstudio@gmail.com")
    .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isTeacherEmail(email) {
  return teacherEmails().includes((email || "").trim().toLowerCase());
}

// Case-insensitive exact match: escape the characters ilike treats as wildcards ("_" is common in emails).
export function emailPattern(email) {
  return email.replace(/[\\%_]/g, "\\$&");
}

// Works out who is calling from the sign-in token the app sends.
// Returns { role: "teacher", email } | { role: "student", email, student } | null.
export async function whoIs(req) {
  const supabase = db();
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!supabase || !token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase();
  if (error || !email) return null;
  if (isTeacherEmail(email)) return { role: "teacher", email };
  const { data: student } = await supabase
    .from("students").select("*").ilike("email", emailPattern(email)).neq("status", "canceled").maybeSingle();
  return student ? { role: "student", email, student } : null;
}

// Everything one student sees in the app.
export async function studentBundle(studentId) {
  const supabase = db();
  const [student, notes, assignments, questions] = await Promise.all([
    supabase.from("students").select("id, name, email, plan, status, next_lesson_at, zoom_url").eq("id", studentId).single(),
    supabase.from("lesson_notes").select("*").eq("student_id", studentId).order("lesson_date", { ascending: false }).limit(50),
    supabase.from("assignments").select("*").eq("student_id", studentId).eq("archived", false).order("created_at", { ascending: false }),
    supabase.from("questions").select("*").eq("student_id", studentId).order("created_at", { ascending: false }).limit(100),
  ]);
  for (const r of [student, notes, assignments, questions]) if (r.error) throw r.error;
  return { student: student.data, notes: notes.data, assignments: assignments.data, questions: questions.data };
}
