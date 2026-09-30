import { createClient } from "@supabase/supabase-js";

// Server-only client. Uses the service key, so never import this into a browser component.
let client;
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // lets the site run before Supabase is connected
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export async function bookedTimes() {
  const supabase = db();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("start_at, minutes")
    .gte("start_at", new Date().toISOString())
    .in("status", ["pending", "confirmed"]);
  if (error) throw error;
  return data.map((b) => ({ start: b.start_at, minutes: b.minutes }));
}
