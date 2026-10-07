# Vercel deployment

## Phase 1: public website

Deploy the repository root as **Next.js**, with Node **22.x**, install command
`npm ci`, build command `npm run build`, and the default output directory.
`vercel.json` supplies the framework and London function region.

No database or environment variables are required in this phase. Public prayer,
about, contact and discount pages work. Database-backed verification, Wallet
passes, committee tools and APIs show temporary-unavailability messages (APIs
return HTTP 503). No membership data is stored by this deployment.

Validate with `npm test` before deploying. Existing full-project lint findings
in UI components are separate from the hosting migration.

## Vercel account and project

Link this folder to the ULISOC project in the intended Vercel team, then deploy
with the Vercel CLI. A CLI deployment uploads the current local code; it does
not push the changes to GitHub. Future Git-based deployments require committing
and pushing the migrated version first.

## Domain at Spaceship

The domain can stay registered with Spaceship. After verifying the Vercel URL:

1. Add the intended domain in Vercel **Settings → Domains**.
2. Check the domain's authoritative nameservers. Edit DNS at that provider.
3. Set the exact root A and www CNAME records Vercel supplies.
4. Preserve existing MX, SPF, DKIM, DMARC and other email records.
5. Verify HTTPS and both domain variants. Save previous web DNS values for rollback.

Do not transfer the domain or change nameservers just to host on Vercel.
The existing code references `ulisoc.uk`; confirm ownership before changing DNS.

## Phase 2: Supabase

The data layer runs on Supabase Postgres (`db/client.ts`, `db/sql.ts`,
`db/index.ts`, schema in `db/schema.ts`, migrations in `drizzle/`). The app
connects with the Postgres connection string. Every table has row-level
security enabled, so Supabase's public REST API cannot read the app's data.

Members-only content uses Supabase Auth. The committee adds each member's email
and full name to the `members` table in the Supabase Table Editor (or by CSV
import). A visitor enters their email and Supabase emails them a sign-in code,
but only if that email is on the list. Every members-only request checks the
list again, so deleting a row removes access immediately. All Supabase Auth
calls run in the site's API routes (`lib/supabase-server.ts`, `lib/members.ts`),
so no Supabase keys reach the browser.

Supabase dashboard settings this needs:
- **Authentication → Email Templates → Magic Link:** include `{{ .Token }}` so
  the email contains the 6-digit code.
- **Authentication → Providers → Email:** set the email OTP length to 6.
- **Authentication → Emails → SMTP Settings:** set up a custom SMTP provider,
  such as Brevo. Supabase's built-in sender only allows a few emails per hour.

1. Create the Supabase project in the London (eu-west-2) region to match Vercel.
2. Run the migrations from your machine with the session pooler or direct URL:
   `DIRECT_DATABASE_URL=... npm run db:migrate`
3. In Vercel, set `DATABASE_URL` (transaction pooler, port 6543) and the
   application secrets listed in `.env.example`.
4. Set `NEXT_PUBLIC_DATABASE_FEATURES_ENABLED=true` and redeploy. If it is unset
   or `false`, the site behaves as in phase 1.

The old SQLite migrations are kept in `db/sqlite-legacy/` for reference only.
Before importing any real records, obtain the original encryption and HMAC keys
securely. Brevo email and Google Wallet also require access to their original
service accounts. Keep secrets and database exports out of Git and chat.

References:
- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://vercel.com/docs/domains/working-with-domains/add-a-domain
