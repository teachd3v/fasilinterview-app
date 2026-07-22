import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from 'drizzle-orm';
import { candidates, interviews } from '../src/db/schema.js';
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

    // Fetch all candidates
    const allCandidates = await db.select().from(candidates).orderBy(desc(candidates.createdAt));
    
    // Fetch all interviews
    const allInterviews = await db.select().from(interviews);

    // Group interviews by candidateId
    const results = allCandidates.map(candidate => {
      const candidateInterviews = allInterviews.filter(i => i.candidateId === candidate.id);
      
      let averageScore = 0;
      let hasRedFlag = false;
      let combinedAspects = [];
      let interviewerNames = [];

      if (candidateInterviews.length > 0) {
        const total = candidateInterviews.reduce((acc, curr) => acc + curr.totalScore, 0);
        averageScore = total / candidateInterviews.length;
        
        hasRedFlag = candidateInterviews.some(i => i.hasRedFlag);
        interviewerNames = candidateInterviews.map(i => i.interviewerName);
        combinedAspects = candidateInterviews.map(i => ({
          interviewerName: i.interviewerName,
          interviewId: i.id,
          aspectResults: i.aspectResults
        }));
      }

      return {
        id: candidate.id,
        candidateName: candidate.candidateName,
        jenisKelamin: candidate.jenisKelamin,
        kampus: candidate.kampus,
        posisiLamaran: candidate.posisiLamaran,
        wilayahPendaftaran: candidate.wilayahPendaftaran,
        ipk: candidate.ipk,
        lamaStudi: candidate.lamaStudi,
        tautanBerkas: candidate.tautanBerkas,
        status: candidate.status,
        createdAt: candidate.createdAt,
        // Aggregated interview data
        interviews: candidateInterviews,
        interviewerNames: interviewerNames.join(' & '),
        totalScore: averageScore,
        hasRedFlag,
        combinedAspects
      };
    });
    
    // Only return candidates that have at least one interview, or all of them? 
    // Usually Admin Dashboard only shows evaluated candidates, so let's filter:
    const evaluatedCandidates = results.filter(r => r.interviews.length > 0);
    
    // Sort by average total score descending
    evaluatedCandidates.sort((a, b) => b.totalScore - a.totalScore);

    return res.status(200).json({ success: true, data: evaluatedCandidates });

  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
