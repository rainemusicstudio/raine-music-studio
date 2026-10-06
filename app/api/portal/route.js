import { NextResponse } from "next/server";
import { db } from "../../../lib/supabase";
import { whoIs, studentBundle } from "../../../lib/portal";

export const dynamic = "force-dynamic";

const bad = (error, status = 400) => NextResponse.json({ error }, { status });
const text = (v, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// GET: everything the signed-in person needs for their screen.
export async function GET(req) {
  try {
    const me = await whoIs(req);
    if (!me) return bad("Please sign in again.", 401);
    if (me.role === "student") return NextResponse.json({ role: "student", ...(await studentBundle(me.student.id)) });

    const studentId = new URL(req.url).searchParams.get("student");
    if (studentId) return NextResponse.json({ role: "teacher", ...(await studentBundle(studentId)) });

    const supabase = db();
    const [students, open] = await Promise.all([
      supabase.from("students").select("id, name, email, plan, status, next_lesson_at").order("name"),
      supabase.from("questions").select("student_id").is("answered_at", null),
    ]);
    if (students.error) throw students.error;
    const openCount = {};
    for (const q of open.data || []) openCount[q.student_id] = (openCount[q.student_id] || 0) + 1;
    return NextResponse.json({
      role: "teacher",
      students: students.data.map((s) => ({ ...s, open_questions: openCount[s.id] || 0 })),
    });
  } catch (err) {
    console.error(err);
    return bad("Something went wrong loading the app. Please refresh.", 500);
  }
}

// POST { action, ... }: every change made from the app.
export async function POST(req) {
  try {
    const me = await whoIs(req);
    if (!me) return bad("Please sign in again.", 401);
    const supabase = db();
    const b = await req.json().catch(() => ({}));

    if (me.role === "student") {
      const sid = me.student.id;
      if (b.action === "toggleAssignment") {
        const { error } = await supabase.from("assignments")
          .update({ done_at: b.done ? new Date().toISOString() : null })
          .eq("id", b.id).eq("student_id", sid);
        if (error) throw error;
      } else if (b.action === "addQuestion") {
        const body = text(b.body, 2000);
        if (!body) return bad("Type your question first.");
        const { error } = await supabase.from("questions").insert({ student_id: sid, body });
        if (error) throw error;
      } else if (b.action === "deleteQuestion") {
        const { error } = await supabase.from("questions").delete().eq("id", b.id).eq("student_id", sid).is("answered_at", null);
        if (error) throw error;
      } else {
        return bad("That isn't something students can change.", 403);
      }
      return NextResponse.json({ ok: true });
    }

    // Teacher actions
    switch (b.action) {
      case "addStudent": {
        const name = text(b.name, 200), email = text(b.email, 200).toLowerCase();
        if (!name || !email.includes("@")) return bad("Add a name and email.");
        const { data, error } = await supabase.from("students")
          .upsert({ name, email, plan: text(b.plan, 100) || null, status: "active" }, { onConflict: "email" })
          .select("id").single();
        if (error) throw error;
        return NextResponse.json({ ok: true, id: data.id });
      }
      case "updateStudent": {
        const { error } = await supabase.from("students").update({
          next_lesson_at: b.next_lesson_at || null,
          zoom_url: text(b.zoom_url, 500) || null,
        }).eq("id", b.studentId);
        if (error) throw error;
        break;
      }
      case "addNote": {
        const note = {
          student_id: b.studentId,
          lesson_date: b.lesson_date || new Date().toISOString().slice(0, 10),
          worked_on: text(b.worked_on), wins: text(b.wins), practice: text(b.practice),
          link_url: text(b.link_url, 500) || null,
        };
        if (!note.worked_on && !note.wins && !note.practice) return bad("Write at least one part of the note.");
        const { error } = await supabase.from("lesson_notes").insert(note);
        if (error) throw error;
        break;
      }
      case "deleteNote": {
        const { error } = await supabase.from("lesson_notes").delete().eq("id", b.id);
        if (error) throw error;
        break;
      }
      case "addAssignment": {
        const title = text(b.title, 300);
        if (!title) return bad("Give the assignment a title.");
        const { error } = await supabase.from("assignments").insert({ student_id: b.studentId, title, details: text(b.details) || null });
        if (error) throw error;
        break;
      }
      case "archiveAssignment": {
        const { error } = await supabase.from("assignments").update({ archived: true }).eq("id", b.id);
        if (error) throw error;
        break;
      }
      case "answerQuestion": {
        const { error } = await supabase.from("questions")
          .update({ answered_at: b.answered ? new Date().toISOString() : null }).eq("id", b.id);
        if (error) throw error;
        break;
      }
      default:
        return bad("Unknown action.");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return bad("That didn't save. Please try again.", 500);
  }
}
