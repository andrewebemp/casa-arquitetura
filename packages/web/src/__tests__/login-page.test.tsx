import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  })),
}));

describe('Login Page', () => {
  it('renders email and password fields', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('renders submit button with PT-BR text', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('renders Google OAuth button with PT-BR text', () => {
    render(<LoginPage />);

    expect(screen.getByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
  });

  it('renders link to signup page', () => {
    render(<LoginPage />);

    expect(screen.getByText('Criar conta')).toBeInTheDocument();
  });
});
