import React from 'react';
import { render, screen } from '@testing-library/react';
import AppLayout from '@/components/layout/AppLayout';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

describe('AppLayout', () => {
  it('renders brand and nav links', () => {
    render(<AppLayout><div>child</div></AppLayout>);
    expect(screen.getByText('Talorix')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Jobs')).toBeInTheDocument();
    expect(screen.getByText('Applicants')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});