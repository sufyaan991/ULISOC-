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

## Phase 2: Supabase (deferred)

Create the Supabase project later. Migrate the SQLite schema/queries to PostgreSQL
and implement the Supabase data layer, authentication, environment variables and
integration tests. The old SQLite migrations cannot simply be run in Supabase.

Before importing any real records, obtain the original encryption and HMAC keys
securely. Brevo email and Google Wallet also require access to their original
service accounts. Keep secrets and database exports out of Git and chat.

Only after the data layer and integrations work should `databaseFeaturesEnabled`
be enabled and the API gate removed or adapted. No Turso account is needed.

References:
- https://vercel.com/docs/frameworks/full-stack/nextjs
- https://vercel.com/docs/domains/working-with-domains/add-a-domain
