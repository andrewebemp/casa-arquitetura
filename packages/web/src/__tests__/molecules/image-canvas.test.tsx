import { render, screen, fireEvent } from '@testing-library/react';
import { ImageCanvas, normalizeCoordinates } from '@/components/molecules/ImageCanvas';
import type { SegmentResult, DetectObjectResponse } from '@/services/editing-service';

describe('normalizeCoordinates', () => {
  it('normalizes click to 0-1 range', () => {
    const rect = { left: 100, top: 200, width: 400, height: 300 } as DOMRect;
    const result = normalizeCoordinates(300, 350, rect);
    expect(result.x).toBe(0.5);
    expect(result.y).toBe(0.5);
  });

  it('clamps to 0 when click is before element', () => {
    const rect = { left: 100, top: 200, width: 400, height: 300 } as DOMRect;
    const result = normalizeCoordinates(50, 100, rect);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('clamps to 1 when click is after element', () => {
    const rect = { left: 100, top: 200, width: 400, height: 300 } as DOMRect;
    const result = normalizeCoordinates(600, 600, rect);
    expect(result.x).toBe(1);
    expect(result.y).toBe(1);
  });

  it('handles top-left corner', () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 } as DOMRect;
    const result = normalizeCoordinates(0, 0, rect);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('handles bottom-right corner', () => {
    const rect = { left: 0, top: 0, width: 100, height: 100 } as DOMRect;
    const result = normalizeCoordinates(100, 100, rect);
    expect(result.x).toBe(1);
    expect(result.y).toBe(1);
  });
});

describe('ImageCanvas', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/render.jpg',
    segments: [] as SegmentResult[],
    selectedSegmentId: null,
    removeMasks: [] as DetectObjectResponse[],
    isProcessing: false,
    progressStage: '',
    progress: 0,
    onImageClick: jest.fn(),
    onSegmentClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image when URL provided', () => {
    render(<ImageCanvas {...defaultProps} />);
    expect(screen.getByAltText('Render do ambiente')).toBeInTheDocument();
  });

  it('renders placeholder when no image', () => {
    render(<ImageCanvas {...defaultProps} imageUrl={null} />);
    expect(screen.getByText('Nenhum render disponivel')).toBeInTheDocument();
  });

  it('renders AI disclaimer', () => {
    render(<ImageCanvas {...defaultProps} />);
    expect(screen.getByText('Imagem ilustrativa gerada por IA')).toBeInTheDocument();
  });

  it('shows processing overlay when isProcessing', () => {
    render(<ImageCanvas {...defaultProps} isProcessing progressStage="Segmentando..." progress={50} />);
    expect(screen.getByText('Segmentando...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('does not show processing overlay when not processing', () => {
    render(<ImageCanvas {...defaultProps} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('calls onImageClick with normalized coords on click', () => {
    const { container } = render(<ImageCanvas {...defaultProps} />);
    const canvas = container.querySelector('[role="img"]')!;

    // Mock getBoundingClientRect
    jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 200, height: 200,
      right: 200, bottom: 200, x: 0, y: 0, toJSON: jest.fn(),
    });

    fireEvent.click(canvas, { clientX: 100, clientY: 100 });

    expect(defaultProps.onImageClick).toHaveBeenCalledWith({ x: 0.5, y: 0.5 });
  });

  it('does not call onImageClick when processing', () => {
    const { container } = render(<ImageCanvas {...defaultProps} isProcessing />);
    const canvas = container.querySelector('[role="img"]')!;

    fireEvent.click(canvas, { clientX: 100, clientY: 100 });

    expect(defaultProps.onImageClick).not.toHaveBeenCalled();
  });
});
