# The Umbrella Network — CA Articleship Masterclass

Next.js site for the 6-day CA Articleship Masterclass. The public pages keep the existing design and copy.

## Stack

- Next.js, TypeScript, React, Tailwind CSS
- Supabase PostgreSQL
- Razorpay
- Resend
- Google Drive and Google Sheets
- Netlify

## Local development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values you need.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Start the app: `npm run dev`

Without Supabase credentials, data is stored in `.data/store.json` on your machine. That file is only for local development. Netlify needs Supabase.

## Netlify

1. Import the repository in Netlify.
2. The build command is `npm run build`. `@netlify/plugin-nextjs` is set in `netlify.toml`.
3. Add the environment variables from `.env.example`.
4. Point the Razorpay webhook to `https://your-domain.com/api/payments/webhook` for `payment.captured`, `payment.failed`, `order.paid`, and `refund.processed`.
5. Share the batch Google Drive folder and the Google Sheet with the service-account email.
6. In Resend, verify the domain used by `RESEND_FROM_EMAIL`.

A scheduled Netlify function calls `/api/cron/retry-fulfillment` every 10 minutes when `CRON_SECRET` is set. Paid registrations stay saved if email, Drive, or Sheets fails. Those steps can be retried from the student page in admin.

The amount charged is the batch fee stored in the database. The browser cannot set the price.

## Admin

Open `/admin/login`. The username, password, and session secret come from environment variables.

## Checks

`npm test` checks batch deadlines, Razorpay signature verification, and registration validation.

`npm run build` creates the production build.
