import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { candidates, interviews, interviewScores } from '../src/db/schema.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const interviewId = parseInt(req.query.id as string);
    if (!interviewId) return res.status(400).json({ error: 'Missing id param' });

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Get Interview
    const interviewData = await db.select().from(interviews).where(eq(interviews.id, interviewId)).limit(1);
    if (interviewData.length === 0) return res.status(404).json({ error: 'Not found' });
    const interview = interviewData[0];

    // Get Candidate
    const candidateData = await db.select().from(candidates).where(eq(candidates.id, interview.candidateId)).limit(1);
    const candidate = candidateData[0];

    // Get Scores
    const scoresData = await db.select().from(interviewScores).where(eq(interviewScores.interviewId, interviewId));

    // Reconstruct Zustand store scores format
    const scoresRecord: Record<string, any> = {};
    scoresData.forEach(s => {
      scoresRecord[s.indicatorId] = { score: s.score, note: s.note || '' };
    });

    // Reconstruct aspect notes
    const aspectNotes: Record<string, string> = {};
    if (interview.aspectResults && Array.isArray(interview.aspectResults)) {
      interview.aspectResults.forEach((res: any) => {
        if (res.note) {
          aspectNotes[res.id] = res.note;
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        interviewId: interview.id,
        candidate,
        scores: scoresRecord,
        aspectNotes,
        totalScore: interview.totalScore,
        category: interview.category,
        hasRedFlag: interview.hasRedFlag,
        aspectResults: interview.aspectResults
      }
    });

  } catch (error: any) {
    console.error('Error fetching details:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
