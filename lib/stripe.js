import Stripe from "stripe";

let client;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set. Add it in your hosting settings (see README).");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY.trim());
  return client;
}

// The site's own web address. Uses NEXT_PUBLIC_SITE_URL if set; otherwise
// Netlify's built-in URL, then the address the visitor is actually on.
export function siteUrl(req) {
  let url = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL;
  if (!url && req) {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "https";
    if (host) url = `${proto}://${host}`;
  }
  return (url || "http://localhost:3000").replace(/\/$/, "");
}
