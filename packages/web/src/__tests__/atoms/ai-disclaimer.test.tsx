import { render, screen } from '@testing-library/react';
import { AiDisclaimer } from '@/components/atoms/AiDisclaimer';

describe('AiDisclaimer', () => {
  it('renders inline variant by default', () => {
    render(<AiDisclaimer />);

    expect(screen.getByText('Imagem ilustrativa gerada por IA')).toBeInTheDocument();
  });

  it('renders overlay variant with absolute positioning', () => {
    const { container } = render(<AiDisclaimer variant="overlay" />);

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('absolute');
    expect(el.textContent).toBe('Imagem ilustrativa gerada por IA');
  });

  it('renders inline variant as paragraph', () => {
    const { container } = render(<AiDisclaimer variant="inline" />);

    const el = container.querySelector('p');
    expect(el).toBeInTheDocument();
    expect(el?.textContent).toBe('Imagem ilustrativa gerada por IA');
  });

  it('accepts custom className', () => {
    const { container } = render(<AiDisclaimer className="mt-4" />);

    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain('mt-4');
  });
});
