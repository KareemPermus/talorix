import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Applicants from '@/pages/applicants';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), put: jest.fn() },
}));

const mockApplicants = [
  { id: 1, job_id: 1, name: 'Alice Smith', email: 'alice@test.com', phone: '555-1234', resume_url: '', cover_letter: 'Hello', status: 'pending', applied_at: '2024-01-15T00:00:00Z', job_title: 'Engineer' },
  { id: 2, job_id: 2, name: 'Bob Jones', email: 'bob@test.com', phone: '', resume_url: '', cover_letter: '', status: 'accepted', applied_at: '2024-01-16T00:00:00Z', job_title: 'Designer' },
];

describe('Applicants Page', () => {
  beforeEach(() => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockApplicants });
    (apiClient.put as jest.Mock).mockResolvedValue({ data: {} });
  });

  it('renders applicants list', async () => {
    render(<Applicants />);
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('filters by search', async () => {
    render(<Applicants />);
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Search applicants…'), { target: { value: 'Bob' } });
    expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('opens detail drawer on row click', async () => {
    render(<Applicants />);
    await waitFor(() => expect(screen.getByText('Alice Smith')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Alice Smith'));
    expect(screen.getByText('Cover Letter')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('shows error state', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Applicants />);
    await waitFor(() => expect(screen.getByText('Failed to load applicants.')).toBeInTheDocument());
  });
});