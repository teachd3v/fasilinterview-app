import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { candidates } from '../src/db/schema.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Set body size limit to handle base64 images (default is 1mb, let's bump it up slightly just in case, though we compress in frontend)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { candidateId, photoBase64 } = req.body;

    if (!candidateId || !photoBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }
    
    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    await db.update(candidates)
      .set({ photoUrl: photoBase64 })
      .where(eq(candidates.id, candidateId));

    return res.status(200).json({ success: true, message: 'Photo uploaded successfully' });

  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
