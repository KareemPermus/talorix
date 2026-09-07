import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  const isSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const id = Number(req.query.id);

  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  if (req.method === 'GET') {
    try {
      if (isSupabase) {
        const { data, error } = await db.from('applicants').select('*, jobs(title)').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Applicant not found' });
        return res.status(200).json({
          ...data, job_title: data.jobs?.title || '', jobs: undefined
        });
      }
      const row = db.prepare(
        'SELECT a.*, j.title as job_title FROM applicants a LEFT JOIN jobs j ON a.job_id = j.id WHERE a.id = ?'
      ).get(id);
      if (!row) return res.status(404).json({ error: 'Applicant not found' });
      return res.status(200).json(row);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { name, email, phone, resume_url, cover_letter, status, job_id } = req.body;

      if (isSupabase) {
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (resume_url !== undefined) updates.resume_url = resume_url;
        if (cover_letter !== undefined) updates.cover_letter = cover_letter;
        if (status !== undefined) updates.status = status;
        if (job_id !== undefined) updates.job_id = job_id;
        const { data, error } = await db.from('applicants').update(updates).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }

      const existing = db.prepare('SELECT * FROM applicants WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Applicant not found' });
      const stmt = db.prepare(
        'UPDATE applicants SET job_id=?, name=?, email=?, phone=?, resume_url=?, cover_letter=?, status=? WHERE id=?'
      );
      stmt.run(
        job_id ?? existing.job_id, name ?? existing.name, email ?? existing.email,
        phone ?? existing.phone, resume_url ?? existing.resume_url,
        cover_letter ?? existing.cover_letter, status ?? existing.status, id
      );
      const updated = db.prepare(
        'SELECT a.*, j.title as job_title FROM applicants a LEFT JOIN jobs j ON a.job_id = j.id WHERE a.id = ?'
      ).get(id);
      return res.status(200).json(updated);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}