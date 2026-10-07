import { drizzle } from "drizzle-orm/postgres-js";
import { getSqlClient } from "./client";
import * as schema from "./schema";

export function getDb() {
  return drizzle(getSqlClient(), { schema });
}
