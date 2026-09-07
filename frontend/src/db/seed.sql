INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status, slug)
VALUES ('Senior Frontend Engineer', 'Acme Corp', 'San Francisco, CA', 'full-time', 120000, 180000, 'We are looking for a senior frontend engineer to join our team.', 'active', 'senior-frontend-engineer-acme')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status, slug)
VALUES ('Backend Developer', 'Globex Inc', 'Remote', 'full-time', 100000, 150000, 'Build scalable backend services with Node.js and PostgreSQL.', 'active', 'backend-developer-globex')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status, slug)
VALUES ('UX Designer', 'Initech', 'New York, NY', 'contract', 80000, 120000, 'Design beautiful user experiences for our SaaS platform.', 'active', 'ux-designer-initech')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status, slug)
VALUES ('DevOps Engineer', 'Umbrella Ltd', 'Austin, TX', 'full-time', 110000, 160000, 'Manage CI/CD pipelines and cloud infrastructure.', 'active', 'devops-engineer-umbrella')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, status, slug)
VALUES ('Junior Data Analyst', 'Soylent Corp', 'Chicago, IL', 'part-time', 50000, 70000, 'Analyze data and create reports for business stakeholders.', 'active', 'junior-data-analyst-soylent')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO applicants (job_id, name, email, phone, status, slug)
VALUES ((SELECT id FROM jobs WHERE slug='senior-frontend-engineer-acme'), 'Alice Johnson', 'alice@example.com', '555-0101', 'pending', 'alice-johnson-acme-fe')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO applicants (job_id, name, email, phone, status, slug)
VALUES ((SELECT id FROM jobs WHERE slug='senior-frontend-engineer-acme'), 'Bob Smith', 'bob@example.com', '555-0102', 'reviewed', 'bob-smith-acme-fe')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO applicants (job_id, name, email, phone, status, slug)
VALUES ((SELECT id FROM jobs WHERE slug='backend-developer-globex'), 'Carol White', 'carol@example.com', NULL, 'pending', 'carol-white-globex-be')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO applicants (job_id, name, email, phone, status, slug)
VALUES ((SELECT id FROM jobs WHERE slug='ux-designer-initech'), 'Dave Brown', 'dave@example.com', '555-0104', 'interviewed', 'dave-brown-initech-ux')
ON CONFLICT (slug) DO NOTHING;