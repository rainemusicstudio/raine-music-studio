import Stripe from "stripe";

let client;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it in your hosting settings (see README).");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
