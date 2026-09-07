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
        const { data, error } = await db.from('jobs').select('*').eq('id', id).single();
        if (error) return res.status(404).json({ error: 'Job not found' });
        return res.status(200).json(data);
      }
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      return res.status(200).json(job);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { title, company, location, type, salary_min, salary_max, description, status } = req.body;
      if (isSupabase) {
        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (company !== undefined) updates.company = company;
        if (location !== undefined) updates.location = location;
        if (type !== undefined) updates.type = type;
        if (salary_min !== undefined) updates.salary_min = salary_min;
        if (salary_max !== undefined) updates.salary_max = salary_max;
        if (description !== undefined) updates.description = description;
        if (status !== undefined) updates.status = status;
        const { data, error } = await db.from('jobs').update(updates).eq('id', id).select().single();
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json(data);
      }
      const existing = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Job not found' });
      const stmt = db.prepare(
        'UPDATE jobs SET title=?, company=?, location=?, type=?, salary_min=?, salary_max=?, description=?, status=? WHERE id=?'
      );
      stmt.run(
        title ?? existing.title, company ?? existing.company, location ?? existing.location,
        type ?? existing.type, salary_min ?? existing.salary_min, salary_max ?? existing.salary_max,
        description ?? existing.description, status ?? existing.status, id
      );
      const job = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      return res.status(200).json(job);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      if (isSupabase) {
        const { error } = await db.from('jobs').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ success: true });
      }
      const existing = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
      if (!existing) return res.status(404).json({ error: 'Job not found' });
      db.prepare('DELETE FROM jobs WHERE id = ?').run(id);
      return res.status(200).json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).json({ error: 'Method not allowed' });
}