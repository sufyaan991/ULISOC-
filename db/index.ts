import { drizzle } from "drizzle-orm/sqlite-proxy";
import { databaseUnavailable } from "./sql";
import * as schema from "./schema";

// Existing SQLite schema is retained as migration reference only.
// Replace this with the Supabase data layer when that project is configured.
export function getDb() {
  return drizzle(async () => databaseUnavailable(), { schema });
}
