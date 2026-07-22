import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { candidates } from '../src/db/schema.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { candidateId, status } = req.body;

    if (!candidateId || !status) {
      return res.status(400).json({ error: 'Bad Request: Missing parameters' });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    await db.update(candidates)
      .set({ status: status })
      .where(eq(candidates.id, candidateId));

    return res.status(200).json({ success: true, message: 'Status updated' });

  } catch (error: any) {
    console.error('Error updating status:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
