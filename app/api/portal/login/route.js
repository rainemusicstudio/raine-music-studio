import { NextResponse } from "next/server";
import { db } from "../../../../lib/supabase";
import { siteUrl } from "../../../../lib/stripe";
import { emailPattern, isTeacherEmail } from "../../../../lib/portal";

// Emails a one-tap sign-in link, but only to current students and Erin.
// The answer is the same either way, so nobody can use this to check who's a student.
export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  const clean = (email || "").trim().toLowerCase();
  if (!clean.includes("@")) return NextResponse.json({ error: "Please enter your email." }, { status: 400 });

  const supabase = db();
  if (!supabase) return NextResponse.json({ error: "The studio app isn't connected yet." }, { status: 500 });

  let allowed = isTeacherEmail(clean);
  if (!allowed) {
    const { data } = await supabase.from("students").select("id").ilike("email", emailPattern(clean)).neq("status", "canceled").maybeSingle();
    allowed = Boolean(data);
  }

  if (allowed) {
    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: `${siteUrl(req)}/portal`, shouldCreateUser: true },
    });
    if (error) {
      console.error("Sign-in email failed:", error.message);
      const tooMany = error.status === 429 || /rate/i.test(error.message);
      return NextResponse.json({
        error: tooMany
          ? "Too many sign-in emails were sent just now. Please wait a few minutes and try again."
          : "We couldn't send your sign-in email. Please try again, or email rainemusicstudio@gmail.com.",
      }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
