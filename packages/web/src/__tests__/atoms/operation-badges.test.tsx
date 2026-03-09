import { render, screen } from '@testing-library/react';
import { OperationBadges } from '@/components/atoms/OperationBadges';
import type { RefinementOperation } from '@decorai/shared';

describe('OperationBadges', () => {
  it('renders nothing for empty operations', () => {
    const { container } = render(<OperationBadges operations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badges for each operation', () => {
    const operations: RefinementOperation[] = [
      { type: 'remove', target: 'tapete', params: {} },
      { type: 'change', target: 'piso -> madeira clara', params: {} },
    ];

    render(<OperationBadges operations={operations} />);

    expect(screen.getByText('remover: tapete')).toBeInTheDocument();
    expect(screen.getByText('mudar: piso -> madeira clara')).toBeInTheDocument();
  });

  it('applies correct color classes per type', () => {
    const operations: RefinementOperation[] = [
      { type: 'add', target: 'plantas', params: {} },
      { type: 'remove', target: 'tapete', params: {} },
    ];

    render(<OperationBadges operations={operations} />);

    const addBadge = screen.getByText('adicionar: plantas');
    expect(addBadge.className).toContain('bg-green-100');

    const removeBadge = screen.getByText('remover: tapete');
    expect(removeBadge.className).toContain('bg-red-100');
  });

  it('handles unknown operation type gracefully', () => {
    const operations = [
      { type: 'unknown' as 'add', target: 'test', params: {} },
    ];

    render(<OperationBadges operations={operations} />);

    expect(screen.getByText('unknown: test')).toBeInTheDocument();
  });
});
