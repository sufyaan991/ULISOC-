// Retain existing query call sites until the Supabase migration is implemented.
// No database is connected in the initial Vercel deployment.
export function databaseUnavailable(): never {
  throw new Error("Database features are unavailable until Supabase is connected.");
}

export class SqlStatement {
  constructor(readonly sql: string, readonly args: unknown[] = []) {}
  bind(...args: unknown[]) { return new SqlStatement(this.sql, args); }
  async first<T = Record<string, unknown>>(): Promise<T | null> { return databaseUnavailable(); }
  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> { return databaseUnavailable(); }
  async run(): Promise<void> { return databaseUnavailable(); }
}

export const database = {
  prepare(sql: string) { return new SqlStatement(sql); },
  async batch(statements: SqlStatement[]): Promise<void> {
    void statements;
    return databaseUnavailable();
  },
};
