import { render, screen } from '@testing-library/react';
import { DiagnosticCTA } from '@/components/diagnostic/DiagnosticCTA';
import type { DiagnosticCta } from '@decorai/shared';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('DiagnosticCTA', () => {
  const baseCta: DiagnosticCta = {
    message: 'Seu imovel tem grande potencial de valorizacao!',
    plan_recommended: 'pro',
    upgrade_url: '/pricing',
  };

  it('renders CTA message', () => {
    render(<DiagnosticCTA cta={baseCta} score={30} />);

    expect(screen.getByText('Seu imovel tem grande potencial de valorizacao!')).toBeInTheDocument();
  });

  it('shows recommended plan badge', () => {
    render(<DiagnosticCTA cta={baseCta} score={50} />);

    expect(screen.getByText('Recomendado: Pro')).toBeInTheDocument();
  });

  it('shows Business plan when recommended', () => {
    render(
      <DiagnosticCTA
        cta={{ ...baseCta, plan_recommended: 'business' }}
        score={20}
      />
    );

    expect(screen.getByText('Recomendado: Business')).toBeInTheDocument();
  });

  it('links to /pricing for anonymous users', () => {
    render(<DiagnosticCTA cta={baseCta} score={50} />);

    const link = screen.getByText('Ver Planos');
    expect(link.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('shows "Criar Projeto" for authenticated users with paid tier', () => {
    render(
      <DiagnosticCTA
        cta={baseCta}
        score={50}
        isAuthenticated={true}
        hasPaidTier={true}
        originalImageUrl="https://example.com/photo.jpg"
      />
    );

    const link = screen.getByText('Criar Projeto com Esta Foto');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('/app/novo')
    );
  });

  it('applies red style for critical score (< 40)', () => {
    render(<DiagnosticCTA cta={baseCta} score={25} />);

    const container = screen.getByTestId('diagnostic-cta');
    expect(container.className).toContain('bg-red-50');
  });

  it('applies amber style for moderate score (40-70)', () => {
    render(<DiagnosticCTA cta={baseCta} score={55} />);

    const container = screen.getByTestId('diagnostic-cta');
    expect(container.className).toContain('bg-amber-50');
  });

  it('applies green style for good score (> 70)', () => {
    render(<DiagnosticCTA cta={baseCta} score={85} />);

    const container = screen.getByTestId('diagnostic-cta');
    expect(container.className).toContain('bg-green-50');
  });
});
