import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    console.log("Adding photo_url to candidates...");
    await sql`ALTER TABLE candidates ADD COLUMN IF NOT EXISTS photo_url TEXT;`;
    console.log("Dropping photo_url from interviews...");
    await sql`ALTER TABLE interviews DROP COLUMN IF EXISTS photo_url;`;
    console.log("Migration successful!");
  } catch (e) {
    console.error(e);
  }
}
main();
