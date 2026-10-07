import { defineConfig } from "drizzle-kit";

// Migrations use Supabase's direct or session-pooler connection (port 5432),
// not the transaction pooler the app uses at runtime.
export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL ?? "" },
});
