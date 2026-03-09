import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

describe('Dashboard Page', () => {
  it('renders welcome message in PT-BR', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Bem-vindo ao DecorAI')).toBeInTheDocument();
  });

  it('renders quick action cards', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Novo Projeto')).toBeInTheDocument();
    expect(screen.getByText('Meus Projetos')).toBeInTheDocument();
    expect(screen.getByText('Gerar Render')).toBeInTheDocument();
    expect(screen.getByText('Minha Assinatura')).toBeInTheDocument();
  });
});
