import { Pool } from "pg";

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "petlogixdb",
  password: process.env.DB_PASSWORD || "Pizzapie0921", // <-- change if needed
  port: process.env.DB_PORT || 5432,
});
