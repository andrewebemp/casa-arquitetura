import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingFAQ } from '@/components/molecules/PricingFAQ';

describe('PricingFAQ', () => {
  it('renders FAQ heading', () => {
    render(<PricingFAQ />);

    expect(screen.getByText('Perguntas Frequentes')).toBeInTheDocument();
  });

  it('renders all FAQ questions', () => {
    render(<PricingFAQ />);

    expect(screen.getByText('Posso trocar de plano?')).toBeInTheDocument();
    expect(screen.getByText('Como funciona o periodo de teste?')).toBeInTheDocument();
    expect(screen.getByText('Quais formas de pagamento?')).toBeInTheDocument();
    expect(screen.getByText('O que acontece se meus renders acabarem?')).toBeInTheDocument();
  });

  it('answers are hidden by default', () => {
    render(<PricingFAQ />);

    expect(screen.queryByText(/Sim! Voce pode fazer upgrade/)).not.toBeInTheDocument();
  });

  it('expands answer on click', async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    await user.click(screen.getByText('Posso trocar de plano?'));

    expect(screen.getByText(/Sim! Voce pode fazer upgrade/)).toBeInTheDocument();
  });

  it('collapses answer on second click', async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    await user.click(screen.getByText('Posso trocar de plano?'));
    expect(screen.getByText(/Sim! Voce pode fazer upgrade/)).toBeInTheDocument();

    await user.click(screen.getByText('Posso trocar de plano?'));
    expect(screen.queryByText(/Sim! Voce pode fazer upgrade/)).not.toBeInTheDocument();
  });

  it('opening one FAQ closes the previous one', async () => {
    const user = userEvent.setup();
    render(<PricingFAQ />);

    await user.click(screen.getByText('Posso trocar de plano?'));
    expect(screen.getByText(/Sim! Voce pode fazer upgrade/)).toBeInTheDocument();

    await user.click(screen.getByText('Quais formas de pagamento?'));
    expect(screen.queryByText(/Sim! Voce pode fazer upgrade/)).not.toBeInTheDocument();
    expect(screen.getByText(/Aceitamos cartoes de credito/)).toBeInTheDocument();
  });
});
