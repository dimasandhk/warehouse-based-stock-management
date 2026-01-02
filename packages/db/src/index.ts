import { env } from "@warehouse-based-stock-management-oppo-technical-test/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export { eq, and, or, sql, desc, asc, like, ilike, gt, gte, lt, lte, ne, inArray, notInArray, isNull, isNotNull } from "drizzle-orm";

