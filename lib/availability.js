// When trial lessons can be booked.
// EDIT ME: these hours are placeholders until Erin sets her real schedule.
// Days: 0 = Sunday, 1 = Monday ... 6 = Saturday. Times are in the studio time zone.

export const STUDIO_TIME_ZONE = "America/Chicago";

export const TRIAL_HOURS = {
  1: [["15:00", "19:00"]], // Monday 3–7 pm
  2: [["15:00", "19:00"]], // Tuesday
  3: [["15:00", "19:00"]], // Wednesday
  4: [["15:00", "19:00"]], // Thursday
  6: [["10:00", "13:00"]], // Saturday 10 am–1 pm
};

export const TRIAL_SLOT_MINUTES = 30;
export const BUFFER_MINUTES = 15; // gap between bookings
export const MIN_NOTICE_HOURS = 24; // no same-day surprises
export const DAYS_AHEAD = 14;

// Offset (in minutes) of a time zone from UTC at a given instant.
function tzOffsetMinutes(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date);
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+v.year, +v.month - 1, +v.day, +v.hour, +v.minute, +v.second);
  return (asUtc - date.getTime()) / 60000;
}

// A wall-clock time in the studio's zone -> a real Date.
export function studioTimeToDate(year, month, day, hh, mm) {
  const guess = new Date(Date.UTC(year, month - 1, day, hh, mm));
  const offset = tzOffsetMinutes(guess, STUDIO_TIME_ZONE);
  return new Date(guess.getTime() - offset * 60000);
}

function studioDateParts(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  }).formatToParts(date);
  const v = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(v.weekday);
  return { year: +v.year, month: +v.month, day: +v.day, weekday };
}

// All open trial start times for the next DAYS_AHEAD days, minus anything already booked.
// `booked` is a list of { start: ISO string, minutes: number }.
export function openTrialSlots(booked = [], now = new Date()) {
  const earliest = now.getTime() + MIN_NOTICE_HOURS * 3600000;
  const busy = booked.map((b) => {
    const s = new Date(b.start).getTime();
    return [s - BUFFER_MINUTES * 60000, s + (b.minutes + BUFFER_MINUTES) * 60000];
  });
  const slots = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = studioDateParts(new Date(now.getTime() + i * 86400000));
    for (const [from, to] of TRIAL_HOURS[d.weekday] || []) {
      const [fh, fm] = from.split(":").map(Number);
      const [th, tm] = to.split(":").map(Number);
      for (let m = fh * 60 + fm; m + TRIAL_SLOT_MINUTES <= th * 60 + tm; m += TRIAL_SLOT_MINUTES + BUFFER_MINUTES) {
        const start = studioTimeToDate(d.year, d.month, d.day, Math.floor(m / 60), m % 60);
        const s = start.getTime();
        const e = s + TRIAL_SLOT_MINUTES * 60000;
        if (s < earliest) continue;
        if (busy.some(([bs, be]) => s < be && e > bs)) continue;
        slots.push(start.toISOString());
      }
    }
  }
  return [...new Set(slots)].sort();
}

export function isOpenSlot(iso, booked = []) {
  return openTrialSlots(booked).includes(new Date(iso).toISOString());
}
