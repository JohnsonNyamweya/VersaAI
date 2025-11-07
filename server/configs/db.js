import {neon} from '@neondatabase/serverless'

// Clean up any accidental newlines or spaces from the env var
const cleanUrl = process.env.DATABASE_URL?.replace(/\s+/g, "");

if (!cleanUrl) {
  throw new Error("DATABASE_URL is not set in your environment");
}

const sql = neon(cleanUrl);

export default sql;