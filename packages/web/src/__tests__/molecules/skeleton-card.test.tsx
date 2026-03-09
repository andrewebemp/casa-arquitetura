import { render } from '@testing-library/react';
import { SkeletonCard } from '@/components/molecules/SkeletonCard';

describe('SkeletonCard', () => {
  it('renders animated placeholder', () => {
    const { container } = render(<SkeletonCard />);

    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });
});
