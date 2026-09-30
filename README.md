# Raine Music Studio — website (Phase 1)

The studio website: homepage, trial booking with payment, membership signup with monthly autopay, studio policies, and a welcome page.

## What's inside
| Page | What it does |
|---|---|
| `/` | Homepage (brand, lessons, prices, welcome kit, about) |
| `/trial` | Pick an open trial time, then pay $40 through Stripe |
| `/join` | Choose a plan, agree to policies, start monthly autopay through Stripe |
| `/welcome` | The "your next adventure is on the way" confirmation page |
| `/policies` | Studio policies (**draft — Erin to review**) |

## Where to change things
- **Prices:** `lib/plans.js`
- **Trial hours:** `lib/availability.js` (placeholder hours for now)
- **Policies:** `lib/policies.js`
- **Colors and fonts:** `app/globals.css`

## Setup (one time)
1. **Supabase:** create a project, open *SQL Editor*, paste `supabase/schema.sql`, and run it.
2. **Stripe:** in *test mode*, copy the secret key. Add a webhook pointing to `https://YOUR-SITE/api/stripe/webhook` with these events: `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.deleted`. Copy its signing secret.
3. **Netlify:** import this GitHub repo, then add the variables from `.env.example` under *Site configuration → Environment variables*.
4. Test a trial booking and a signup with Stripe's test card `4242 4242 4242 4242`.
5. When everything works, switch to Stripe live keys and point the domain at Netlify.

## Still to come (Phase 1b)
- Automatic emails (Zoom link, calendar invite, welcome email)
- Welcome kit add-ons at signup
- Student login and the app (Phase 2)
