import { createMocks } from 'node-mocks-http';
import applicantsHandler from '@/pages/api/applicants/index';
import applicantByIdHandler from '@/pages/api/applicants/[id]';

delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/applicants', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await applicantsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST creates an applicant', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { job_id: 1, name: 'Test User', email: 'test@test.com' },
    });
    await applicantsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.name).toBe('Test User');
  });

  it('POST returns 400 for missing fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { name: 'No email' } });
    await applicantsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});

describe('/api/applicants/[id]', () => {
  it('GET returns applicant with job_title', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await applicantByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('job_title');
  });

  it('GET returns 404 for nonexistent', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await applicantByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('PUT updates applicant status', async () => {
    const { req, res } = createMocks({ method: 'PUT', query: { id: '1' }, body: { status: 'accepted' } });
    await applicantByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe('accepted');
  });
});