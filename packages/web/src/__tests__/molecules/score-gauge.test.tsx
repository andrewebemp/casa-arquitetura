import { render, screen } from '@testing-library/react';
import { ScoreGauge } from '@/components/molecules/ScoreGauge';

describe('ScoreGauge', () => {
  it('renders the score value', () => {
    render(<ScoreGauge score={75} />);

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('shows "Critico" label for score < 40', () => {
    render(<ScoreGauge score={25} />);

    expect(screen.getByText('Critico')).toBeInTheDocument();
  });

  it('shows "Moderado" label for score 40-70', () => {
    render(<ScoreGauge score={55} />);

    expect(screen.getByText('Moderado')).toBeInTheDocument();
  });

  it('shows "Bom" label for score > 70', () => {
    render(<ScoreGauge score={85} />);

    expect(screen.getByText('Bom')).toBeInTheDocument();
  });

  it('clamps score to 0-100 range', () => {
    const { rerender } = render(<ScoreGauge score={-10} />);
    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(<ScoreGauge score={150} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('has meter role with aria attributes', () => {
    render(<ScoreGauge score={60} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '60');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('has accessible label', () => {
    render(<ScoreGauge score={45} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', 'Score do imovel: 45 de 100');
  });

  it('rounds decimal scores', () => {
    render(<ScoreGauge score={67.8} />);

    expect(screen.getByText('68')).toBeInTheDocument();
  });

  it('handles edge score values at boundaries', () => {
    const { rerender } = render(<ScoreGauge score={40} />);
    expect(screen.getByText('Moderado')).toBeInTheDocument();

    rerender(<ScoreGauge score={70} />);
    expect(screen.getByText('Moderado')).toBeInTheDocument();

    rerender(<ScoreGauge score={71} />);
    expect(screen.getByText('Bom')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ScoreGauge score={50} className="mt-4" />);

    expect(container.firstChild).toHaveClass('mt-4');
  });
});
