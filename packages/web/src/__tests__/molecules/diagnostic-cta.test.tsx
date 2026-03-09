import { render, screen } from '@testing-library/react';
import { DiagnosticCta } from '@/components/molecules/DiagnosticCta';
import type { DiagnosticCta as DiagnosticCtaType } from '@decorai/shared';

const baseCta: DiagnosticCtaType = {
  message: 'Seu imovel tem potencial, mas esta perdendo valor.',
  plan_recommended: 'pro',
  upgrade_url: '/pricing',
};

describe('DiagnosticCta', () => {
  it('renders loss percentage', () => {
    render(
      <DiagnosticCta cta={baseCta} score={55} estimatedLossPercent={25} />
    );

    expect(screen.getByText('25%')).toBeInTheDocument();
  });

  it('renders CTA message', () => {
    render(
      <DiagnosticCta cta={baseCta} score={55} estimatedLossPercent={25} />
    );

    expect(screen.getByText(baseCta.message)).toBeInTheDocument();
  });

  it('renders recommended plan label', () => {
    render(
      <DiagnosticCta cta={baseCta} score={55} estimatedLossPercent={25} />
    );

    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders Business plan label when recommended', () => {
    const businessCta: DiagnosticCtaType = {
      ...baseCta,
      plan_recommended: 'business',
    };

    render(
      <DiagnosticCta cta={businessCta} score={20} estimatedLossPercent={40} />
    );

    expect(screen.getByText('Business')).toBeInTheDocument();
  });

  it('renders action button linking to upgrade URL', () => {
    render(
      <DiagnosticCta cta={baseCta} score={55} estimatedLossPercent={25} />
    );

    const link = screen.getByText('Transformar Meu Imovel');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/pricing');
  });

  it('uses red style for critical score (< 40)', () => {
    const { container } = render(
      <DiagnosticCta cta={baseCta} score={20} estimatedLossPercent={40} />
    );

    expect(container.firstChild).toHaveClass('border-red-200');
  });

  it('uses amber style for moderate score (40-70)', () => {
    const { container } = render(
      <DiagnosticCta cta={baseCta} score={55} estimatedLossPercent={25} />
    );

    expect(container.firstChild).toHaveClass('border-amber-200');
  });

  it('uses green style for good score (> 70)', () => {
    const { container } = render(
      <DiagnosticCta cta={baseCta} score={80} estimatedLossPercent={10} />
    );

    expect(container.firstChild).toHaveClass('border-green-200');
  });

  it('applies custom className', () => {
    const { container } = render(
      <DiagnosticCta cta={baseCta} score={55} estimatedLossPercent={25} className="mt-8" />
    );

    expect(container.firstChild).toHaveClass('mt-8');
  });
});
