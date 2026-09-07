import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostJob from '@/pages/post-job';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({ __esModule: true, default: { post: jest.fn() } }));
jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }));

describe('PostJob page', () => {
  it('renders the form', () => {
    render(<PostJob />);
    expect(screen.getByText('Post a Job')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Senior Product Designer/)).toBeInTheDocument();
    expect(screen.getByText('Post Job')).toBeInTheDocument();
  });

  it('shows validation error when required fields empty', async () => {
    render(<PostJob />);
    fireEvent.click(screen.getByText('Post Job'));
    expect(await screen.findByText('Please fill in all required fields.')).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    (apiClient.post as jest.Mock).mockResolvedValue({ data: { id: 1, title: 'Dev', company: 'Co', location: 'Remote', type: 'Full-time', salary_min: 80000, salary_max: 120000, description: 'desc', status: 'active', created_at: '2024-01-01' } });
    render(<PostJob />);
    fireEvent.change(screen.getByPlaceholderText(/Senior Product Designer/), { target: { value: 'Dev', name: 'title' } });
    fireEvent.change(screen.getByPlaceholderText(/Acme Inc/), { target: { value: 'Co', name: 'company' } });
    fireEvent.change(screen.getByPlaceholderText(/Remote/), { target: { value: 'Remote', name: 'location' } });
    fireEvent.change(screen.getByPlaceholderText(/Describe the role/), { target: { value: 'A great role', name: 'description' } });
    fireEvent.click(screen.getByText('Post Job'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/jobs', expect.objectContaining({ title: 'Dev', company: 'Co' })));
  });
});