import { render, screen } from '@testing-library/react';
import { DiagnosticResult } from '@/components/organisms/DiagnosticResult';
import type { DiagnosticResponse } from '@decorai/shared';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

const mockResult: DiagnosticResponse = {
  id: 'diag-1',
  user_id: null,
  original_image_url: 'https://example.com/original.jpg',
  staged_preview_url: null,
  analysis: {
    overall_score: 35,
    estimated_loss_percent: 30,
    estimated_loss_brl: null,
    issues: [
      { category: 'lighting', severity: 'high', description: 'Iluminacao ruim' },
      { category: 'staging', severity: 'medium', description: 'Sem mobilia' },
    ],
    recommendations: ['Abrir cortinas para luz natural'],
  },
  session_token: null,
  created_at: '2026-01-15T12:00:00Z',
  cta: {
    message: 'Seu imovel esta perdendo muito valor!',
    plan_recommended: 'business',
    upgrade_url: '/pricing',
  },
};

describe('DiagnosticResult', () => {
  it('renders score gauge', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('Resultado da Analise')).toBeInTheDocument();
  });

  it('renders estimated loss percent', () => {
    render(<DiagnosticResult result={mockResult} />);

    const lossTexts = screen.getAllByText('30%');
    expect(lossTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders issue list', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('Iluminacao ruim')).toBeInTheDocument();
    expect(screen.getByText('Sem mobilia')).toBeInTheDocument();
  });

  it('renders recommendations', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('Abrir cortinas para luz natural')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('Ver Planos')).toBeInTheDocument();
    expect(screen.getByText('Seu imovel esta perdendo muito valor!')).toBeInTheDocument();
  });

  it('does not render Before/After slider when no staged_preview_url', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });

  it('renders Before/After slider when staged_preview_url is available', () => {
    const resultWithPreview: DiagnosticResponse = {
      ...mockResult,
      staged_preview_url: 'https://example.com/staged.jpg',
    };

    render(<DiagnosticResult result={resultWithPreview} />);

    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows AI disclaimer when staged preview is shown', () => {
    const resultWithPreview: DiagnosticResponse = {
      ...mockResult,
      staged_preview_url: 'https://example.com/staged.jpg',
    };

    render(<DiagnosticResult result={resultWithPreview} />);

    const disclaimers = screen.getAllByText('Imagem ilustrativa gerada por IA');
    expect(disclaimers.length).toBeGreaterThanOrEqual(1);
  });
});
