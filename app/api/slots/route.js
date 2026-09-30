import { NextResponse } from "next/server";
import { openTrialSlots } from "../../../lib/availability";
import { bookedTimes } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const slots = openTrialSlots(await bookedTimes());
    return NextResponse.json({ slots });
  } catch (err) {
    console.error(err);
    // Short, non-secret reason to help with setup troubleshooting.
    const reason = err?.message || String(err);
    return NextResponse.json({ error: "Could not load open times.", reason: reason.slice(0, 200), db: Boolean(process.env.SUPABASE_URL), key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) }, { status: 500 });
  }
}
