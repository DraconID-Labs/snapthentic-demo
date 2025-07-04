import { createDatabase } from "@snapthentic/database";
import { env } from "~/env";

export const db = createDatabase(env.DATABASE_URL);
