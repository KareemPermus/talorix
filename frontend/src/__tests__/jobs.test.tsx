import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Jobs from '@/pages/jobs';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { get: jest.fn() } }));
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const mockJobs = [
  { id: 1, title: 'Frontend Dev', company: 'Acme', location: 'Remote', type: 'Full-time', salary_min: 100000, salary_max: 150000, description: 'desc', status: 'active', created_at: new Date().toISOString() },
  { id: 2, title: 'Backend Dev', company: 'Beta', location: 'NYC', type: 'Contract', salary_min: 80000, salary_max: 120000, description: 'desc', status: 'closed', created_at: new Date().toISOString() },
];

describe('Jobs page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders jobs from API', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockJobs });
    render(<Jobs />);
    await waitFor(() => expect(screen.getByText('Frontend Dev')).toBeInTheDocument());
    expect(screen.getByText('Backend Dev')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Jobs />);
    await waitFor(() => expect(screen.getByText('Failed to load jobs')).toBeInTheDocument());
  });

  it('filters by search', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockJobs });
    render(<Jobs />);
    await waitFor(() => screen.getByText('Frontend Dev'));
    fireEvent.change(screen.getByPlaceholderText(/Search/), { target: { value: 'Backend' } });
    expect(screen.queryByText('Frontend Dev')).not.toBeInTheDocument();
    expect(screen.getByText('Backend Dev')).toBeInTheDocument();
  });

  it('filters by type chip', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockJobs });
    render(<Jobs />);
    await waitFor(() => screen.getByText('Frontend Dev'));
    fireEvent.click(screen.getByText('Contract'));
    expect(screen.queryByText('Frontend Dev')).not.toBeInTheDocument();
    expect(screen.getByText('Backend Dev')).toBeInTheDocument();
  });
});