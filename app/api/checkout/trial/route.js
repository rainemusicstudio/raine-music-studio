import { NextResponse } from "next/server";
import { stripe, siteUrl } from "../../../../lib/stripe";
import { db, bookedTimes } from "../../../../lib/supabase";
import { isOpenSlot, STUDIO_TIME_ZONE } from "../../../../lib/availability";
import { TRIAL } from "../../../../lib/plans";

export async function POST(req) {
  try {
    const { start, name, email, focus, lessonType, forWhom, studentName, studentAge, ageRange, experience, heardFrom, phone, smsOptIn } = await req.json();
    const forChild = forWhom === "child";
    const clean = (v, n = 120) => (typeof v === "string" ? v.trim().slice(0, n) : "") || null;
    if (!start || !name?.trim() || !email?.includes("@")) {
      return NextResponse.json({ error: "Please add your name, email, and a time." }, { status: 400 });
    }
    const digits = String(phone || "").replace(/\D/g, "");
    const phoneE164 = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits.startsWith("1") ? `+${digits}` : null;
    if (!phoneE164) {
      return NextResponse.json({ error: "Please add a 10-digit US mobile number." }, { status: 400 });
    }
    if (!lessonType || !experience || (forChild ? !studentName?.trim() || !studentAge : !ageRange)) {
      return NextResponse.json({ error: "Please fill in the lesson details." }, { status: 400 });
    }
    if (!isOpenSlot(start, await bookedTimes())) {
      return NextResponse.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
    }

    const when = new Date(start).toLocaleString("en-US", {
      timeZone: STUDIO_TIME_ZONE, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
    });

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: email.trim(),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: TRIAL.amount,
          product_data: { name: `${TRIAL.name} (${TRIAL.minutes} min)`, description: when },
        },
      }],
      metadata: { kind: "trial", start, name: name.trim(), focus: (focus || "").slice(0, 400) },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // hold the time for 30 minutes
      success_url: `${siteUrl(req)}/welcome?type=trial&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl(req)}/trial?canceled=1`,
    });

    // Hold the slot while they pay. The Stripe webhook confirms or releases it.
    const supabase = db();
    if (supabase) {
      const { error } = await supabase.from("bookings").insert({
        kind: "trial", start_at: start, minutes: TRIAL.minutes, status: "pending",
        name: name.trim(), email: email.trim(), focus: focus || null, stripe_session_id: session.id,
        lesson_type: clean(lessonType), for_child: forChild,
        student_name: forChild ? clean(studentName) : null,
        student_age: forChild ? parseInt(studentAge, 10) || null : null,
        experience: clean(experience), heard_from: clean(heardFrom),
        age_range: forChild ? null : clean(ageRange, 20),
        phone: phoneE164, sms_opt_in: smsOptIn === true,
        sms_opt_in_at: smsOptIn === true ? new Date().toISOString() : null,
      });
      if (error) throw error;
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong starting checkout. Please try again, or email rainemusicstudio@gmail.com." }, { status: 500 });
  }
}
