import { NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { db } from "../../../../lib/supabase";

// Stripe calls this after someone pays (or walks away from checkout).
export async function POST(req) {
  const body = await req.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET?.trim());
  } catch (err) {
    console.error("Webhook signature check failed:", err.message);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const supabase = db();
  const session = event.data.object;

  try {
    if (event.type === "checkout.session.completed" && session.metadata?.kind === "trial") {
      await supabase?.from("bookings").update({ status: "confirmed" }).eq("stripe_session_id", session.id);
      // TODO(phase 1b): email the Zoom link + calendar invite, and add to Erin's Google Calendar.
    }

    if (event.type === "checkout.session.expired" && session.metadata?.kind === "trial") {
      await supabase?.from("bookings").update({ status: "released" }).eq("stripe_session_id", session.id);
    }

    if (event.type === "checkout.session.completed" && session.metadata?.kind === "membership") {
      await supabase?.from("students").upsert({
        email: session.customer_details?.email || session.customer_email,
        name: session.metadata.name,
        plan: session.metadata.plan,
        preferred_times: session.metadata.preferred_times,
        policies_version: session.metadata.policies_version,
        policies_agreed_at: session.metadata.policies_agreed_at,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        status: "active",
        joined_at: new Date().toISOString(),
      }, { onConflict: "email" });
      // TODO(phase 1b): send the welcome email.
    }

    if (event.type === "customer.subscription.deleted") {
      await supabase?.from("students").update({ status: "canceled" }).eq("stripe_subscription_id", session.id);
    }
  } catch (err) {
    console.error("Webhook handling failed:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
