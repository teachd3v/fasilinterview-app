import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function main() {
  const sql = neon(process.env.DATABASE_URL);
  await sql`DROP TABLE IF EXISTS interview_scores, interviews, candidates CASCADE`;
  console.log('Tables dropped');
}

main().catch(console.error);
