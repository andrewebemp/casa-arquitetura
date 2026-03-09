import { render, screen } from '@testing-library/react';
import { DisclaimerFooter } from '@/components/disclaimer-footer';

describe('DisclaimerFooter', () => {
  it('renders disclaimer text', () => {
    render(<DisclaimerFooter />);

    expect(screen.getByText('Imagens ilustrativas geradas por IA')).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    const { container } = render(<DisclaimerFooter />);

    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
