import { render, screen, fireEvent } from '@testing-library/react';
import { BeforeAfterSlider } from '@/components/molecules/BeforeAfterSlider';

const mockRect = {
  left: 0, width: 100, top: 0, right: 100,
  bottom: 100, height: 100, x: 0, y: 0, toJSON: jest.fn(),
};

describe('BeforeAfterSlider', () => {
  const defaultProps = {
    beforeUrl: 'https://example.com/before.jpg',
    afterUrl: 'https://example.com/after.jpg',
  };

  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
  });

  it('renders before and after images', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    expect(screen.getByAltText('Antes')).toHaveAttribute('src', defaultProps.beforeUrl);
    expect(screen.getByAltText('Depois')).toHaveAttribute('src', defaultProps.afterUrl);
  });

  it('renders ANTES and DEPOIS labels by default', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    expect(screen.getByText('ANTES')).toBeInTheDocument();
    expect(screen.getByText('DEPOIS')).toBeInTheDocument();
  });

  it('renders custom labels', () => {
    render(
      <BeforeAfterSlider
        {...defaultProps}
        beforeLabel="Original"
        afterLabel="Decorado"
      />
    );

    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Decorado')).toBeInTheDocument();
  });

  it('has slider role with correct aria attributes', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
  });

  it('uses custom initialPosition', () => {
    render(<BeforeAfterSlider {...defaultProps} initialPosition={30} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-valuenow', '30');
  });

  it('applies custom className', () => {
    render(<BeforeAfterSlider {...defaultProps} className="aspect-video w-full" />);

    const slider = screen.getByRole('slider');
    expect(slider.className).toContain('aspect-video');
    expect(slider.className).toContain('w-full');
  });

  it('has touch-action none for mobile support', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    expect(slider.style.touchAction).toBe('none');
  });

  it('updates position on mouse down', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.mouseDown(slider, { clientX: 75 });
    expect(slider).toHaveAttribute('aria-valuenow', '75');
  });

  it('tracks drag movement', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.mouseDown(slider, { clientX: 50 });
    fireEvent.mouseMove(slider, { clientX: 25 });
    expect(slider).toHaveAttribute('aria-valuenow', '25');
  });

  it('stops tracking after mouse up', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.mouseDown(slider, { clientX: 60 });
    fireEvent.mouseUp(slider);
    fireEvent.mouseMove(slider, { clientX: 90 });
    expect(slider).toHaveAttribute('aria-valuenow', '60');
  });

  it('clamps position between 0 and 100', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    fireEvent.mouseDown(slider, { clientX: 150 });
    expect(slider).toHaveAttribute('aria-valuenow', '100');
  });

  it('makes images non-draggable', () => {
    render(<BeforeAfterSlider {...defaultProps} />);

    const images = screen.getAllByRole('img');
    images.forEach((img) => {
      expect(img).toHaveAttribute('draggable', 'false');
    });
  });
});
