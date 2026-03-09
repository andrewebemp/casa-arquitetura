import { render, screen } from '@testing-library/react';
import { IssueCard } from '@/components/diagnostic/IssueCard';
import type { DiagnosticIssue } from '@decorai/shared';

describe('IssueCard', () => {
  const baseIssue: DiagnosticIssue = {
    category: 'lighting',
    severity: 'high',
    description: 'Iluminacao insuficiente no ambiente principal',
  };

  it('renders category label', () => {
    render(<IssueCard issue={baseIssue} />);

    expect(screen.getByText('Iluminacao')).toBeInTheDocument();
  });

  it('renders severity badge with correct text', () => {
    render(<IssueCard issue={baseIssue} />);

    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<IssueCard issue={baseIssue} />);

    expect(screen.getByText('Iluminacao insuficiente no ambiente principal')).toBeInTheDocument();
  });

  it('renders medium severity correctly', () => {
    render(<IssueCard issue={{ ...baseIssue, severity: 'medium' }} />);

    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('renders low severity correctly', () => {
    render(<IssueCard issue={{ ...baseIssue, severity: 'low' }} />);

    expect(screen.getByText('Baixa')).toBeInTheDocument();
  });

  it('renders different categories', () => {
    const categories: DiagnosticIssue['category'][] = ['staging', 'composition', 'quality', 'clutter'];
    const labels = ['Staging', 'Composicao', 'Qualidade', 'Organizacao'];

    categories.forEach((category, idx) => {
      const { unmount } = render(
        <IssueCard issue={{ ...baseIssue, category }} />
      );
      expect(screen.getByText(labels[idx])).toBeInTheDocument();
      unmount();
    });
  });
});
