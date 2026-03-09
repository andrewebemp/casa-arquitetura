import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '@/app/(auth)/signup/page';

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
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

  it('renders LGPD consent checkbox', () => {
    render(<SignupPage />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('renders privacy policy link', () => {
    render(<SignupPage />);

    expect(screen.getByText('Politica de Privacidade')).toBeInTheDocument();
  });

  it('shows error when submitting without consent', async () => {
    const user = userEvent.setup();
    render(<SignupPage />);

    const nameInput = screen.getByLabelText('Nome');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Senha');
    const submitButton = screen.getByRole('button', { name: 'Criar conta' });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByRole('alert')).toHaveTextContent('Voce deve concordar');
  });
});
