import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickSuggestions } from '@/components/molecules/QuickSuggestions';

describe('QuickSuggestions', () => {
  const defaultProps = {
    onSelect: jest.fn(),
    visible: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all suggestion chips when visible', () => {
    render(<QuickSuggestions {...defaultProps} />);

    expect(screen.getByText('Mais aconchegante')).toBeInTheDocument();
    expect(screen.getByText('Mudar cor das paredes')).toBeInTheDocument();
    expect(screen.getByText('Trocar piso')).toBeInTheDocument();
    expect(screen.getByText('Remover tapete')).toBeInTheDocument();
    expect(screen.getByText('Adicionar plantas')).toBeInTheDocument();
    expect(screen.getByText('Mudar iluminacao')).toBeInTheDocument();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(
      <QuickSuggestions {...defaultProps} visible={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onSelect when chip is clicked', async () => {
    const user = userEvent.setup();
    render(<QuickSuggestions {...defaultProps} />);

    await user.click(screen.getByText('Trocar piso'));

    expect(defaultProps.onSelect).toHaveBeenCalledWith('Trocar piso');
  });
});
