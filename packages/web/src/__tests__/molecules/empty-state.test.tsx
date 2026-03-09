import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/molecules/EmptyState';

describe('EmptyState', () => {
  it('renders default message and CTA', () => {
    render(<EmptyState />);

    expect(screen.getByText('Nenhum projeto ainda')).toBeInTheDocument();
    expect(screen.getByText('Crie seu primeiro projeto de staging')).toBeInTheDocument();
    expect(screen.getByText('+ Novo Projeto')).toBeInTheDocument();
  });

  it('CTA links to /projects/new by default', () => {
    render(<EmptyState />);

    const link = screen.getByText('+ Novo Projeto');
    expect(link.closest('a')).toHaveAttribute('href', '/projects/new');
  });

  it('renders custom title and message', () => {
    render(
      <EmptyState
        title="Sem favoritos"
        message="Adicione projetos aos favoritos"
        ctaLabel="Ver projetos"
        ctaHref="/projects"
      />
    );

    expect(screen.getByText('Sem favoritos')).toBeInTheDocument();
    expect(screen.getByText('Adicione projetos aos favoritos')).toBeInTheDocument();
    expect(screen.getByText('Ver projetos')).toBeInTheDocument();
  });
});
