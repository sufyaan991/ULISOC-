import postgres from "postgres";

// One pooled client per server instance. Use Supabase's transaction pooler
// (port 6543) on Vercel; it does not support prepared statements.
let client: postgres.Sql | undefined;

export function getSqlClient() {
  if (client) return client;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  client = postgres(url, {
    prepare: false,
    max: 5,
    idle_timeout: 20,
    ssl: url.includes("localhost") || url.includes("127.0.0.1") ? false : "require",
    // Millisecond timestamps and COUNT/SUM results are int8/numeric; return them as numbers.
    types: {
      bigint: { to: 20, from: [20, 1700], serialize: (value: number) => String(value), parse: (value: string) => Number(value) },
    },
  });
  return client;
}
