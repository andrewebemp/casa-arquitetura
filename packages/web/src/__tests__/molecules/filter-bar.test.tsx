import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from '@/components/molecules/FilterBar';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders style filter dropdown', () => {
    render(<FilterBar />);

    expect(screen.getByLabelText('Filtrar por estilo')).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    render(<FilterBar />);

    expect(screen.getByLabelText('Ordenar por')).toBeInTheDocument();
  });

  it('renders favorites toggle', () => {
    render(<FilterBar />);

    expect(screen.getByText('Favoritos')).toBeInTheDocument();
  });

  it('updates URL when style filter changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar />);

    const select = screen.getByLabelText('Filtrar por estilo');
    await user.selectOptions(select, 'industrial');

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('style=industrial'),
      { scroll: false }
    );
  });

  it('updates URL when sort changes', async () => {
    const user = userEvent.setup();
    render(<FilterBar />);

    const select = screen.getByLabelText('Ordenar por');
    await user.selectOptions(select, 'oldest');

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('sort=oldest'),
      { scroll: false }
    );
  });

  it('toggles favorites filter on click', async () => {
    const user = userEvent.setup();
    render(<FilterBar />);

    await user.click(screen.getByText('Favoritos'));

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('favorites=true'),
      { scroll: false }
    );
  });
});
