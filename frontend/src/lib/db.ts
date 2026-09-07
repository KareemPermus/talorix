import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      salary_min INTEGER,
      salary_max INTEGER,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS applicants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      resume_url TEXT,
      cover_letter TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      applied_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM jobs').get();
  if (count.c === 0) {
    db.exec(`
      INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status) VALUES
        ('Senior Frontend Engineer', 'Acme Corp', 'San Francisco, CA', 'full-time', 120000, 180000, 'We are looking for a senior frontend engineer to join our team.', 'active'),
        ('Backend Developer', 'Globex Inc', 'Remote', 'full-time', 100000, 150000, 'Build scalable backend services with Node.js and PostgreSQL.', 'active'),
        ('UX Designer', 'Initech', 'New York, NY', 'contract', 80000, 120000, 'Design beautiful user experiences for our SaaS platform.', 'active'),
        ('DevOps Engineer', 'Umbrella Ltd', 'Austin, TX', 'full-time', 110000, 160000, 'Manage CI/CD pipelines and cloud infrastructure.', 'active'),
        ('Junior Data Analyst', 'Soylent Corp', 'Chicago, IL', 'part-time', 50000, 70000, 'Analyze data and create reports for business stakeholders.', 'active');
    `);
    db.exec(`
      INSERT INTO applicants (job_id, name, email, phone, status) VALUES
        (1, 'Alice Johnson', 'alice@example.com', '555-0101', 'pending'),
        (1, 'Bob Smith', 'bob@example.com', '555-0102', 'reviewed'),
        (2, 'Carol White', 'carol@example.com', NULL, 'pending'),
        (3, 'Dave Brown', 'dave@example.com', '555-0104', 'interviewed');
    `);
  }

  return db;
}

function isSupabase(client: any): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export { isSupabase };