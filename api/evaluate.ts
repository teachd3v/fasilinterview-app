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
    let candId: number;
    
    // Upsert candidate by name (since candidate data is fixed from CSV, we just insert if not exists, or update if exists to keep it fresh)
    const existingCandidate = await db.select().from(candidates).where(eq(candidates.candidateName, candidate.candidateName)).limit(1);
    
    if (existingCandidate.length > 0) {
      candId = existingCandidate[0].id;
      // Optionally update candidate data just in case CSV changed
      await db.update(candidates).set({
        jenisKelamin: candidate.jenisKelamin,
        posisiLamaran: candidate.posisiLamaran,
        wilayahPendaftaran: candidate.wilayahPendaftaran,
        kampus: candidate.kampus,
        prodi: candidate.prodi,
        ipk: candidate.ipk,
        lamaStudi: candidate.lamaStudi,
        tautanBerkas: candidate.tautanBerkas,
      }).where(eq(candidates.id, candId));
    } else {
      const [newCandidate] = await db.insert(candidates).values({
        candidateName: candidate.candidateName,
        jenisKelamin: candidate.jenisKelamin,
        posisiLamaran: candidate.posisiLamaran,
        wilayahPendaftaran: candidate.wilayahPendaftaran,
        kampus: candidate.kampus,
        prodi: candidate.prodi,
        ipk: candidate.ipk,
        lamaStudi: candidate.lamaStudi,
        tautanBerkas: candidate.tautanBerkas,
      }).returning({ id: candidates.id });
      candId = newCandidate.id;
    }

    if (interviewId) {
      // Update existing interview
      await db.update(interviews).set({
        interviewerName: candidate.interviewerName,
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
    } else {
      // Cek Anti-Duplikasi: Pastikan interviewer belum pernah menilai kandidat ini
      const existingInterview = await db.select().from(interviews).where(
        eq(interviews.candidateId, candId)
      );
      
      const hasEvaluated = existingInterview.some(i => i.interviewerName === candidate.interviewerName);
      if (hasEvaluated) {
        throw new Error(`Interviewer ${candidate.interviewerName} sudah pernah mengevaluasi kandidat ini. Silakan gunakan fitur Edit di Admin Dashboard jika ingin mengubah nilai.`);
      }
      
      // Create new interview
      const [newInterview] = await db.insert(interviews).values({
        candidateId: candId,
        interviewerName: candidate.interviewerName,
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
