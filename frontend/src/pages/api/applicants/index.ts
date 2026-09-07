import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const isSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (req.method === 'GET') {
    try {
      const jobId = req.query.job_id ? Number(req.query.job_id) : null;

      if (isSupabase) {
        let query = db.from('applicants').select('*, jobs(title)');
        if (jobId) query = query.eq('job_id', jobId);
        const { data, error } = await query.order('applied_at', { ascending: false });
        if (error) return res.status(500).json({ error: error.message });
        const mapped = (data || []).map((a: any) => ({
          id: a.id, job_id: a.job_id, name: a.name, email: a.email,
          phone: a.phone, resume_url: a.resume_url, cover_letter: a.cover_letter,
          status: a.status, applied_at: a.applied_at,
          job_title: a.jobs?.title || ''
        }));
        return res.status(200).json(mapped);
      }

      let sql = 'SELECT a.*, j.title as job_title FROM applicants a LEFT JOIN jobs j ON a.job_id = j.id';
      const params: any[] = [];
      if (jobId) { sql += ' WHERE a.job_id = ?'; params.push(jobId); }
      sql += ' ORDER BY a.applied_at DESC';
      const rows = db.prepare(sql).all(...params);
      return res.status(200).json(rows);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { job_id, name, email, phone, resume_url, cover_letter, status } = req.body;
      if (!job_id || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const appStatus = status || 'pending';

      if (isSupabase) {
        const slug = `${name}-${job_id}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await db.from('applicants').insert({
          job_id, name, email, phone: phone || null, resume_url: resume_url || null,
          cover_letter: cover_letter || null, status: appStatus, slug
        }).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(201).json(data);
      }

      const stmt = db.prepare(
        'INSERT INTO applicants (job_id, name, email, phone, resume_url, cover_letter, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
      );
      const result = stmt.run(job_id, name, email, phone || null, resume_url || null, cover_letter || null, appStatus);
      const applicant = db.prepare('SELECT * FROM applicants WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(applicant);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}