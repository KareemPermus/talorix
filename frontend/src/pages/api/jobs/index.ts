import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const isSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (req.method === 'GET') {
    try {
      if (isSupabase) {
        const { data, error } = await db.from('jobs').select('*').order('created_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
      const rows = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();
      return res.status(200).json(rows);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, company, location, type, salary_min, salary_max, description, status } = req.body;
      if (!title || !company || !location || !type || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const jobStatus = status || 'active';

      if (isSupabase) {
        const slug = `${title}-${company}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await db.from('jobs').insert({
          title, company, location, type, salary_min: salary_min || null, salary_max: salary_max || null, description, status: jobStatus, slug
        }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      }

      const stmt = db.prepare(
        'INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      );
      const result = stmt.run(title, company, location, type, salary_min || null, salary_max || null, description, jobStatus);
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(job);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}