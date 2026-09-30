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
    return NextResponse.json({ error: "Could not load open times." }, { status: 500 });
  }
}
