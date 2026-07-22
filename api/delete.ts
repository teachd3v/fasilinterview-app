import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, inArray } from 'drizzle-orm';
import { candidates, interviews, interviewScores } from '../src/db/schema.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { candidateId } = req.body;
    if (!candidateId) return res.status(400).json({ error: 'Missing candidateId' });

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Find all interviews for this candidate
    const candidateInterviews = await db.select({ id: interviews.id }).from(interviews).where(eq(interviews.candidateId, candidateId));
    
    const interviewIds = candidateInterviews.map(i => i.id);
    
    if (interviewIds.length > 0) {
      // Delete all scores for these interviews
      await db.delete(interviewScores).where(inArray(interviewScores.interviewId, interviewIds));
      // Delete the interviews
      await db.delete(interviews).where(eq(interviews.candidateId, candidateId));
    }
    
    // Delete the candidate
    await db.delete(candidates).where(eq(candidates.id, candidateId));

    return res.status(200).json({ success: true, message: 'Data deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting data:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
