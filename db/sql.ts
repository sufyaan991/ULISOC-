import type postgres from "postgres";
import { getSqlClient } from "./client";

// Minimal prepared-statement API kept from the original SQLite code.
// `?` placeholders are rewritten to Postgres `$n` parameters.
function toPostgres(sql: string) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

type Executor = postgres.Sql | postgres.TransactionSql;

export class SqlStatement {
  constructor(readonly sql: string, readonly args: unknown[] = []) {}
  bind(...args: unknown[]) { return new SqlStatement(this.sql, args); }
  execute(executor: Executor = getSqlClient()) {
    return executor.unsafe(toPostgres(this.sql), this.args as postgres.ParameterOrJSON<never>[]);
  }
  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const rows = await this.execute();
    return (rows[0] as T | undefined) ?? null;
  }
  async all<T = Record<string, unknown>>(): Promise<{ results: T[] }> {
    const rows = await this.execute();
    return { results: [...rows] as T[] };
  }
  async run(): Promise<void> { await this.execute(); }
}

export const database = {
  prepare(sql: string) { return new SqlStatement(sql); },
  // Runs all statements atomically.
  async batch(statements: SqlStatement[]): Promise<void> {
    if (!statements.length) return;
    await getSqlClient().begin(async tx => {
      for (const statement of statements) await statement.execute(tx);
    });
  },
};
