import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { candidates, interviews, interviewScores } from '../src/db/schema.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { interviewId, candidate, evaluation, finalScore, category, hasRedFlag, aspectResults } = req.body;

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    let currentInterviewId = interviewId;

    if (interviewId) {
      // Update existing
      const interviewRecord = await db.select().from(interviews).where(eq(interviews.id, interviewId)).limit(1);
      if (interviewRecord.length > 0) {
        const candId = interviewRecord[0].candidateId;
        
        // Update candidate
        await db.update(candidates).set({
          interviewerName: candidate.interviewerName,
          candidateName: candidate.candidateName,
          ipk: candidate.ipk,
          semester: candidate.semester,
          potentialSkill: candidate.potentialSkill,
        }).where(eq(candidates.id, candId));

        // Update interview metadata
        await db.update(interviews).set({
          totalScore: finalScore,
          category: category,
          hasRedFlag: hasRedFlag,
          aspectResults: aspectResults,
        }).where(eq(interviews.id, interviewId));

        // Delete old scores and re-insert
        await db.delete(interviewScores).where(eq(interviewScores.interviewId, interviewId));
        
        const scoresToInsert = Object.entries(evaluation).map(([indicatorId, data]: any) => ({
          interviewId: interviewId,
          indicatorId: indicatorId,
          score: data.score,
          note: data.note || null,
        }));
        
        if (scoresToInsert.length > 0) {
          await db.insert(interviewScores).values(scoresToInsert);
        }
      }
    } else {
      // Create new
      const [newCandidate] = await db.insert(candidates).values({
        interviewerName: candidate.interviewerName,
        candidateName: candidate.candidateName,
        ipk: candidate.ipk,
        semester: candidate.semester,
        potentialSkill: candidate.potentialSkill,
      }).returning({ id: candidates.id });

      const [newInterview] = await db.insert(interviews).values({
        candidateId: newCandidate.id,
        totalScore: finalScore,
        category: category,
        hasRedFlag: hasRedFlag,
        aspectResults: aspectResults,
      }).returning({ id: interviews.id });
      
      currentInterviewId = newInterview.id;

      const scoresToInsert = Object.entries(evaluation).map(([indicatorId, data]: any) => ({
        interviewId: newInterview.id,
        indicatorId: indicatorId,
        score: data.score,
        note: data.note || null,
      }));

      if (scoresToInsert.length > 0) {
        await db.insert(interviewScores).values(scoresToInsert);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Evaluation saved successfully',
      interviewId: currentInterviewId 
    });

  } catch (error: any) {
    console.error('Error saving evaluation:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
