import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}));

describe('Sidebar', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
  };

  it('renders all navigation links in PT-BR', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Meus Projetos')).toBeInTheDocument();
    expect(screen.getByText('Novo Projeto')).toBeInTheDocument();
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    expect(screen.getByText('Assinatura')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    render(<Sidebar {...defaultProps} />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders DecorAI logo link', () => {
    render(<Sidebar {...defaultProps} />);

    expect(screen.getByText('DecorAI')).toBeInTheDocument();
  });
});
