import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/pages/home';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }));

const mockJobs = [
  { id: 1, title: 'Engineer', company: 'Acme', location: 'Remote', type: 'Full-time', salary_min: 100000, salary_max: 150000, description: 'desc', status: 'active', created_at: new Date().toISOString() },
  { id: 2, title: 'Designer', company: 'Beta', location: 'NYC', type: 'Contract', salary_min: 80000, salary_max: 120000, description: 'desc', status: 'open', created_at: new Date().toISOString() },
];

describe('Home page', () => {
  beforeEach(() => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockJobs });
  });

  it('renders jobs after loading', async () => {
    render(<Home />);
    expect(screen.getByText('Loading jobs…')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('filters jobs by type', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Contract'));
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Home />);
    await waitFor(() => expect(screen.getByText('Failed to load jobs')).toBeInTheDocument());
  });

  it('searches jobs', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText(/Search/), { target: { value: 'Designer' } });
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Designer')).toBeInTheDocument();
  });
});