// Every price in the studio lives here. Change a number once and it updates
// the homepage, the signup page, and what Stripe charges.
// Amounts are in cents (Stripe's format): 20000 = $200.00

export const TRIAL = {
  id: "trial",
  name: "Trial lesson",
  minutes: 30,
  amount: 4000,
};

export const ZOOM_SESSION = {
  id: "zoom-session",
  name: "Look & sound your best on Zoom",
  minutes: 75,
  amount: 17500,
};

export const PLANS = [
  {
    id: "weekly-30",
    name: "30 minutes weekly",
    minutesPerWeek: 30,
    amount: 20000,
    blurb: "Great for younger students and beginners",
  },
  {
    id: "weekly-45",
    name: "45 minutes weekly",
    minutesPerWeek: 45,
    amount: 29000,
    blurb: "Room to warm up, work, and polish a song",
    featured: true,
  },
  {
    id: "weekly-60",
    name: "60 minutes weekly",
    minutesPerWeek: 60,
    amount: 38000,
    blurb: "For serious study, auditions, and projects",
  },
  {
    id: "intensive-120",
    name: "Intensive: 2 hours weekly",
    minutesPerWeek: 120,
    amount: 72000,
    blurb: "Two lessons a week, or one 2-hour block",
    intensive: true,
  },
];

export const LESSONS_PER_YEAR = 44; // 8 weeks off built in for holidays, breaks, and sick days

export function dollars(cents) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export function findPlan(id) {
  return PLANS.find((p) => p.id === id);
}
