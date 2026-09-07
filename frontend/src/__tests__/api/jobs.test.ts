import { createMocks } from 'node-mocks-http';
import jobsHandler from '@/pages/api/jobs/index';
import jobByIdHandler from '@/pages/api/jobs/[id]';

// Force SQLite path
delete process.env.NEXT_PUBLIC_SUPABASE_URL;

describe('/api/jobs', () => {
  it('GET returns array', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await jobsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST creates a job', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { title: 'Test Job', company: 'Test Co', location: 'Remote', type: 'full-time', description: 'A test job' },
    });
    await jobsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Test Job');
  });

  it('POST returns 400 for missing fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { title: 'No company' } });
    await jobsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 405 for unsupported method', async () => {
    const { req, res } = createMocks({ method: 'DELETE' });
    await jobsHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});

describe('/api/jobs/[id]', () => {
  it('GET returns a job', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '1' } });
    await jobByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.id).toBe(1);
  });

  it('GET returns 404 for nonexistent', async () => {
    const { req, res } = createMocks({ method: 'GET', query: { id: '99999' } });
    await jobByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(404);
  });

  it('PUT updates a job', async () => {
    const { req, res } = createMocks({ method: 'PUT', query: { id: '1' }, body: { title: 'Updated' } });
    await jobByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.title).toBe('Updated');
  });

  it('DELETE removes a job', async () => {
    // Create one first
    const { req: cReq, res: cRes } = createMocks({
      method: 'POST',
      body: { title: 'To Delete', company: 'X', location: 'Y', type: 'full-time', description: 'del' },
    });
    await jobsHandler(cReq as any, cRes as any);
    const created = JSON.parse(cRes._getData());

    const { req, res } = createMocks({ method: 'DELETE', query: { id: String(created.id) } });
    await jobByIdHandler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).success).toBe(true);
  });
});