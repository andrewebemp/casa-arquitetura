import { render, screen } from '@testing-library/react';
import SignupPage from '@/app/(auth)/signup/page';

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
    },
  })),
}));

describe('Signup Page', () => {
  it('renders name, email, and password fields', () => {
    render(<SignupPage />);

    expect(screen.getByLabelText('Nome')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('renders submit button with PT-BR text', () => {
    render(<SignupPage />);

    expect(screen.getByRole('button', { name: 'Criar conta' })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    render(<SignupPage />);

    expect(screen.getByText('Entrar')).toBeInTheDocument();
  });
});
