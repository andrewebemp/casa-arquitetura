import { render, screen } from '@testing-library/react';
import { ScoreGauge } from '@/components/molecules/ScoreGauge';

describe('ScoreGauge', () => {
  it('displays score number', () => {
    render(<ScoreGauge score={75} />);

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('/100')).toBeInTheDocument();
  });

  it('shows "Critico" for score < 40', () => {
    render(<ScoreGauge score={25} />);

    expect(screen.getByText('Critico')).toBeInTheDocument();
  });

  it('shows "Moderado" for score 41-70', () => {
    render(<ScoreGauge score={55} />);

    expect(screen.getByText('Moderado')).toBeInTheDocument();
  });

  it('shows "Bom" for score > 70', () => {
    render(<ScoreGauge score={85} />);

    expect(screen.getByText('Bom')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<ScoreGauge score={50} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '50');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('clamps score to 0-100', () => {
    render(<ScoreGauge score={150} />);

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('rounds score to integer', () => {
    render(<ScoreGauge score={65.7} />);

    expect(screen.getByText('66')).toBeInTheDocument();
  });
});
