# ULISOC

University of Leicester Islamic Society website, using Next.js on Vercel.

## Current deployment

The public website runs without a database. Membership verification, Wallet
passes, committee tools and all API routes are temporarily unavailable.
Supabase is the planned database and will be configured separately.

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

## Future Supabase work

`lib/features.ts` disables database-backed services. `proxy.ts` returns a no-store
503 response from API routes. `db/sql.ts` and `db/index.ts` fail closed without
connecting to a database. Existing SQLite schema/migrations and API logic are
retained as reference for the future PostgreSQL/Supabase migration. Do not enable
the feature flag until that migration, authentication and integration tests are
complete. Merely adding Supabase credentials does not enable these features.

The original data may include encrypted records and hashed member emails. If
preserving that data, obtain the original database export and encryption/HMAC
secrets from its owner before migration.

## Historical starter files

`worker/`, `vite.config.ts`, `build/`, `examples/d1/`, `.openai/` and the Sites shell
scripts came from the original Cloudflare/Vinext starter and are not used by the
Vercel build. `app/chatgpt-auth.ts` is an unused legacy helper.

`automation/whatsapp-worker` is a separately hosted service; it remains disabled
until the database and protected automation API are connected.
