"use client";

import { createClient } from "@supabase/supabase-js";

// Browser client, used only for student sign-in. These two values are public by design:
// the publishable key can't read any studio data (every table is locked to the server).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wyrncdvbnkzhyxcnpvoj.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_u1Ip7baei2_r4qWBq5uExA_kOnW1gyO";

let client;
export function browserDb() {
  client ??= createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: true } });
  return client;
}

// fetch() to the studio's /api/portal with the student's sign-in token attached.
export async function portalFetch(path, options = {}) {
  const { data } = await browserDb().auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || "Something went wrong."), { status: res.status });
  return body;
}
