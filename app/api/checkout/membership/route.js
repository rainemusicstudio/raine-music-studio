import { NextResponse } from "next/server";
import { stripe, siteUrl } from "../../../../lib/stripe";
import { findPlan } from "../../../../lib/plans";
import { POLICIES_VERSION } from "../../../../lib/policies";

export async function POST(req) {
  try {
    const { planId, name, email, preferredTimes, agreed } = await req.json();
    const plan = findPlan(planId);
    if (!plan) return NextResponse.json({ error: "Please choose a plan." }, { status: 400 });
    if (!name?.trim() || !email?.includes("@")) {
      return NextResponse.json({ error: "Please add your name and email." }, { status: 400 });
    }
    if (agreed !== true) {
      return NextResponse.json({ error: "Please read and agree to the studio policies." }, { status: 400 });
    }

    const metadata = {
      kind: "membership",
      plan: plan.id,
      name: name.trim(),
      preferred_times: (preferredTimes || "").slice(0, 400),
      policies_version: POLICIES_VERSION,
      policies_agreed_at: new Date().toISOString(),
    };

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: email.trim(),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: plan.amount,
          recurring: { interval: "month" },
          product_data: { name: `Raine Music Studio — ${plan.name}` },
        },
      }],
      subscription_data: { metadata },
      metadata,
      success_url: `${siteUrl(req)}/welcome?type=membership&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl(req)}/join?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong starting checkout." }, { status: 500 });
  }
}
