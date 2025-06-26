import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema";
import 'dotenv/config'
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DB_URI,
})

export const db = drizzle(pool, {schema: schema})