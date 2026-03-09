import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/header';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    refresh: jest.fn(),
  })),
}));

const mockSignOut = jest.fn(() => Promise.resolve());

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: mockSignOut,
    },
  })),
}));

describe('Header', () => {
  const onMenuToggle = jest.fn();

  it('renders hamburger button for mobile', () => {
    render(<Header onMenuToggle={onMenuToggle} />);

    expect(screen.getByLabelText('Abrir menu')).toBeInTheDocument();
  });

  it('renders user avatar button', () => {
    render(<Header onMenuToggle={onMenuToggle} />);

    expect(screen.getByLabelText('Menu do usuario')).toBeInTheDocument();
  });

  it('shows dropdown menu with PT-BR labels on click', () => {
    render(<Header onMenuToggle={onMenuToggle} />);

    fireEvent.click(screen.getByLabelText('Menu do usuario'));

    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByText('Configuracoes')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  it('calls onMenuToggle when hamburger is clicked', () => {
    render(<Header onMenuToggle={onMenuToggle} />);

    fireEvent.click(screen.getByLabelText('Abrir menu'));

    expect(onMenuToggle).toHaveBeenCalled();
  });
});
