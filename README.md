# ULISOC

University of Leicester Islamic Society website, using Next.js on Vercel.

## Current deployment

The public website runs without a database. Membership verification, Wallet
passes, committee tools and API routes use Supabase Postgres and stay disabled
until `NEXT_PUBLIC_DATABASE_FEATURES_ENABLED=true` is set.

## Development

Use Node.js 22.x:

```sh
npm ci
npm run dev
```

- `npm run build`: production build and TypeScript check.
- `npm start`: serve the production build.
- `npm test`: build, public-page and unavailable-service checks, plus UI tests.
- `npm run lint`: ESLint.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel and domain setup.

## Supabase

Copy `.env.example` to `.env.local` and fill in the Supabase connection strings
and secrets. After editing `db/schema.ts`, run `npm run db:generate` to create a
migration. Run `npm run db:migrate` to apply migrations. `lib/features.ts` reads
the feature flag. While the flag is off, `proxy.ts` returns a no-store 503 from
API routes. See DEPLOYMENT.md for setup steps.

The original data may include encrypted records and hashed member emails. If
preserving that data, obtain the original database export and encryption/HMAC
secrets from its owner before migration.

## Historical starter files

`worker/`, `vite.config.ts`, `build/`, `examples/d1/`, `.openai/` and the Sites shell
scripts came from the original Cloudflare/Vinext starter and are not used by the
Vercel build. `app/chatgpt-auth.ts` is an unused legacy helper.
