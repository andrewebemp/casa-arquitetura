import { render, screen } from '@testing-library/react';
import { IssueList } from '@/components/molecules/IssueList';
import type { DiagnosticIssue } from '@decorai/shared';

const mockIssues: DiagnosticIssue[] = [
  { category: 'lighting', severity: 'high', description: 'Iluminacao insuficiente na sala' },
  { category: 'lighting', severity: 'medium', description: 'Sombras excessivas no canto' },
  { category: 'staging', severity: 'high', description: 'Ambiente sem mobilia' },
  { category: 'clutter', severity: 'low', description: 'Objetos pessoais visiveis' },
];

const mockRecommendations = [
  'Melhore a iluminacao natural abrindo cortinas',
  'Adicione moveis basicos para dar referencia de escala',
];

describe('IssueList', () => {
  it('renders issues grouped by category', () => {
    render(
      <IssueList issues={mockIssues} recommendations={[]} />
    );

    expect(screen.getByText('Iluminacao')).toBeInTheDocument();
    expect(screen.getByText('Staging')).toBeInTheDocument();
    expect(screen.getByText('Organizacao')).toBeInTheDocument();
  });

  it('renders severity badges', () => {
    render(
      <IssueList issues={mockIssues} recommendations={[]} />
    );

    expect(screen.getAllByText('Alta')).toHaveLength(2);
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('renders issue descriptions', () => {
    render(
      <IssueList issues={mockIssues} recommendations={[]} />
    );

    expect(screen.getByText('Iluminacao insuficiente na sala')).toBeInTheDocument();
    expect(screen.getByText('Ambiente sem mobilia')).toBeInTheDocument();
  });

  it('renders recommendations when provided', () => {
    render(
      <IssueList issues={mockIssues} recommendations={mockRecommendations} />
    );

    expect(screen.getByText('Recomendacoes')).toBeInTheDocument();
    expect(screen.getByText('Melhore a iluminacao natural abrindo cortinas')).toBeInTheDocument();
    expect(screen.getByText('Adicione moveis basicos para dar referencia de escala')).toBeInTheDocument();
  });

  it('hides recommendations section when empty', () => {
    render(
      <IssueList issues={mockIssues} recommendations={[]} />
    );

    expect(screen.queryByText('Recomendacoes')).not.toBeInTheDocument();
  });

  it('shows empty message when no issues', () => {
    render(
      <IssueList issues={[]} recommendations={[]} />
    );

    expect(screen.getByText('Nenhum problema encontrado.')).toBeInTheDocument();
  });

  it('renders section heading', () => {
    render(
      <IssueList issues={mockIssues} recommendations={[]} />
    );

    expect(screen.getByText('Problemas Encontrados')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <IssueList issues={[]} recommendations={[]} className="mt-6" />
    );

    expect(container.firstChild).toHaveClass('mt-6');
  });
});
