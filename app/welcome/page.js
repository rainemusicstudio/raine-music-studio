import Link from "next/link";
import { stripe } from "../../lib/stripe";
import { STUDIO_TIME_ZONE } from "../../lib/availability";

export const dynamic = "force-dynamic";
export const metadata = { title: "Welcome — Raine Music Studio" };

async function loadSession(id) {
  if (!id || !process.env.STRIPE_SECRET_KEY) return null;
  try { return await stripe().checkout.sessions.retrieve(id); } catch { return null; }
}

function Heart() {
  return (
    <svg width="120" height="110" viewBox="0 0 24 22" aria-hidden="true">
      <path d="M12 21 C 5 15.5, 1 12, 1 7 A 5.5 5.5 0 0 1 12 4.5 A 5.5 5.5 0 0 1 23 7 C 23 12, 19 15.5, 12 21 Z" fill="#C43E27" />
    </svg>
  );
}

export default async function WelcomePage({ searchParams }) {
  const params = await searchParams;
  const session = await loadSession(params?.session_id);
  const isTrial = params?.type === "trial";
  const start = session?.metadata?.start;
  const when = start
    ? new Date(start).toLocaleString("en-US", { timeZone: STUDIO_TIME_ZONE, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })
    : null;

  return (
    <div className="page" style={{ alignItems: "center", textAlign: "center", maxWidth: 640 }}>
      <Heart />
      <h1>{isTrial ? "You're booked!" : "Your next adventure is on the way."}</h1>
      <p className="lead">
        {isTrial
          ? "Your trial lesson is confirmed. Erin will email your Zoom link before your lesson."
          : "Welcome to Raine Music Studio. Watch your inbox for your welcome email and first lesson details."}
      </p>
      {isTrial && when && (
        <div className="summary" style={{ width: "100%", textAlign: "left" }}>
          <div><span>Trial lesson</span><span>{when}</span></div>
          <div><span>Where</span><span>Zoom (link coming by email)</span></div>
        </div>
      )}
      <Link href="/" className="btn btn-peri">Back to the studio</Link>
    </div>
  );
}
