import { render, screen } from '@testing-library/react';
import { DiagnosticResult } from '@/components/organisms/DiagnosticResult';
import type { DiagnosticResponse } from '@decorai/shared';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock BeforeAfterSlider
jest.mock('@/components/molecules/BeforeAfterSlider', () => ({
  BeforeAfterSlider: ({ beforeLabel, afterLabel }: { beforeLabel: string; afterLabel: string }) => (
    <div data-testid="before-after-slider">{beforeLabel} / {afterLabel}</div>
  ),
}));

const mockResult: DiagnosticResponse = {
  id: 'diag-123',
  user_id: null,
  original_image_url: 'https://example.com/original.jpg',
  staged_preview_url: 'https://example.com/staged.jpg',
  analysis: {
    overall_score: 35,
    estimated_loss_percent: 28,
    estimated_loss_brl: null,
    issues: [
      { category: 'lighting', severity: 'high', description: 'Iluminacao muito fraca' },
      { category: 'staging', severity: 'low', description: 'Moveis basicos presentes' },
      { category: 'composition', severity: 'medium', description: 'Angulo nao ideal' },
    ],
    recommendations: [
      'Melhorar iluminacao natural',
      'Adicionar decoracao moderna',
    ],
  },
  cta: {
    message: 'Transforme seu anuncio agora!',
    plan_recommended: 'pro',
    upgrade_url: '/pricing',
  },
  session_token: 'token-abc',
  created_at: '2026-03-09T12:00:00Z',
};

describe('DiagnosticResult', () => {
  it('renders score gauge', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('35')).toBeInTheDocument();
  });

  it('displays estimated loss percentage', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('28%')).toBeInTheDocument();
    expect(screen.getByText(/Seu imovel pode estar perdendo/)).toBeInTheDocument();
  });

  it('renders before/after slider when staged preview available', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByTestId('before-after-slider')).toBeInTheDocument();
    expect(screen.getByText('Imagem ilustrativa gerada por IA')).toBeInTheDocument();
  });

  it('sorts issues by severity (high first)', () => {
    render(<DiagnosticResult result={mockResult} />);

    const issueTexts = screen.getAllByText(/Iluminacao|Angulo|Moveis/).map(el => el.textContent);
    // High severity first, then medium, then low
    expect(issueTexts[0]).toContain('Iluminacao');
  });

  it('renders recommendations with correct title', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('O que fazer para melhorar')).toBeInTheDocument();
    expect(screen.getByText('Melhorar iluminacao natural')).toBeInTheDocument();
    expect(screen.getByText('Adicionar decoracao moderna')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('Transforme seu anuncio agora!')).toBeInTheDocument();
    expect(screen.getByText('Ver Planos')).toBeInTheDocument();
  });

  it('renders share button', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByLabelText('Compartilhar Resultado')).toBeInTheDocument();
  });

  it('renders issues section heading', () => {
    render(<DiagnosticResult result={mockResult} />);

    expect(screen.getByText('Problemas Encontrados')).toBeInTheDocument();
  });
});
