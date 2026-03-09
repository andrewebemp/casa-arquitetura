import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenderRating } from '@/components/molecules/RenderRating';

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) });

describe('RenderRating', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be hidden initially', () => {
    render(<RenderRating renderId="test-render-id" />);
    expect(screen.queryByTestId('render-rating')).not.toBeInTheDocument();
  });

  it('should appear after 3 seconds', () => {
    render(<RenderRating renderId="test-render-id" />);
    expect(screen.queryByTestId('render-rating')).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('render-rating')).toBeInTheDocument();
  });

  it('should render 5 star buttons', () => {
    render(<RenderRating renderId="test-render-id" />);
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    const stars = screen.getAllByRole('button', { name: /estrela/i });
    expect(stars).toHaveLength(5);
  });

  it('should show quality tags after selecting a score', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<RenderRating renderId="test-render-id" />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    const fourStars = screen.getByRole('button', { name: '4 estrelas' });
    await user.click(fourStars);

    expect(screen.getByText('Realismo')).toBeInTheDocument();
    expect(screen.getByText('Estilo')).toBeInTheDocument();
    expect(screen.getByText('Iluminacao')).toBeInTheDocument();
    expect(screen.getByText('Mobilia')).toBeInTheDocument();
    expect(screen.getByText('Composicao')).toBeInTheDocument();
  });

  it('should be dismissable', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<RenderRating renderId="test-render-id" />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    await user.click(closeButton);

    expect(screen.queryByTestId('render-rating')).not.toBeInTheDocument();
  });
});
