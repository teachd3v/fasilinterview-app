import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { candidates, interviews, interviewScores } from '../src/db/schema';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { interviewId } = req.body;
    if (!interviewId) return res.status(400).json({ error: 'Missing interviewId' });

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Get the candidateId from the interview
    const interviewRecord = await db.select().from(interviews).where(eq(interviews.id, interviewId)).limit(1);
    
    if (interviewRecord.length === 0) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const candId = interviewRecord[0].candidateId;

    // Delete in order due to foreign keys
    await db.delete(interviewScores).where(eq(interviewScores.interviewId, interviewId));
    await db.delete(interviews).where(eq(interviews.id, interviewId));
    
    // Check if candidate has other interviews? If not, delete candidate. 
    // In this app, 1 candidate = 1 interview usually, so we just delete the candidate too.
    await db.delete(candidates).where(eq(candidates.id, candId));

    return res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting data:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
