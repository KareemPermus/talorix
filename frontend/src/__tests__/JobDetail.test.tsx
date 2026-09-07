import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobDetail from '@/pages/jobs/[id]';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() } }));
jest.mock('next/router', () => ({ useRouter: () => ({ query: { id: '1' } }) }));

const mockJob = {
  id: 1, title: 'Engineer', company: 'Acme', location: 'Remote', type: 'Full-time',
  salary_min: 100000, salary_max: 150000, description: 'Build things', status: 'active', created_at: '2024-01-01T00:00:00Z'
};

describe('JobDetail', () => {
  it('renders job details on success', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockJob });
    render(<JobDetail />);
    await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Build things')).toBeInTheDocument();
  });

  it('shows error on failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    render(<JobDetail />);
    await waitFor(() => expect(screen.getByText('Failed to load job')).toBeInTheDocument());
  });

  it('toggles apply form', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockJob });
    render(<JobDetail />);
    await waitFor(() => screen.getByText('Apply Now'));
    fireEvent.click(screen.getByText('Apply Now'));
    expect(screen.getByText(/Apply for Engineer/)).toBeInTheDocument();
  });
});