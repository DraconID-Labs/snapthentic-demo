import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export function createDatabase(connectionString: string) {
  const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
  };
  const conn = globalForDb.conn ?? postgres(connectionString);

  if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

  return drizzle(conn, { schema });
}
