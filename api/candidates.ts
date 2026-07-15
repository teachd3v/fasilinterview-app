import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from 'drizzle-orm';
import { candidates, interviews } from '../src/db/schema';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Fetch all interviews with candidate details, sorted by total score descending
    const results = await db
      .select({
        id: interviews.id,
        candidateName: candidates.candidateName,
        interviewerName: candidates.interviewerName,
        ipk: candidates.ipk,
        semester: candidates.semester,
        potentialSkill: candidates.potentialSkill,
        totalScore: interviews.totalScore,
        category: interviews.category,
        hasRedFlag: interviews.hasRedFlag,
        aspectResults: interviews.aspectResults,
        createdAt: interviews.createdAt,
      })
      .from(interviews)
      .innerJoin(candidates, eq(interviews.candidateId, candidates.id))
      .orderBy(desc(interviews.totalScore));

    return res.status(200).json({ success: true, data: results });

  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
