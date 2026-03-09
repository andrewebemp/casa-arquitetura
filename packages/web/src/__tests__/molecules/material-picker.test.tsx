import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MaterialPicker } from '@/components/molecules/MaterialPicker';
import * as editingService from '@/services/editing-service';

jest.mock('@/services/editing-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: 'test' } } }) },
  })),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('MaterialPicker', () => {
  const defaultProps = {
    projectId: 'proj-1',
    segmentId: 'seg-1',
    segmentLabel: 'Piso',
    onClose: jest.fn(),
    onApplied: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (editingService.getMaterials as jest.Mock).mockResolvedValue({
      materials: [
        { id: 'mat-1', name: 'Porcelanato Cinza', description: 'Acabamento matte', thumbnail_url: null, color: '#808080' },
        { id: 'mat-2', name: 'Madeira Clara', description: 'Carvalho natural', thumbnail_url: null, color: '#D2B48C' },
      ],
    });
  });

  it('renders header with segment label', () => {
    renderWithQuery(<MaterialPicker {...defaultProps} />);

    expect(screen.getByText('Materiais — Piso')).toBeInTheDocument();
  });

  it('shows materials after loading', async () => {
    renderWithQuery(<MaterialPicker {...defaultProps} />);

    expect(await screen.findByText('Porcelanato Cinza')).toBeInTheDocument();
    expect(screen.getByText('Madeira Clara')).toBeInTheDocument();
  });

  it('renders custom material input', () => {
    renderWithQuery(<MaterialPicker {...defaultProps} />);

    expect(screen.getByPlaceholderText(/marmore carrara/)).toBeInTheDocument();
  });

  it('renders apply button', () => {
    renderWithQuery(<MaterialPicker {...defaultProps} />);

    expect(screen.getByText('Aplicar')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<MaterialPicker {...defaultProps} />);

    await user.click(screen.getByLabelText('Fechar painel de materiais'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('enables apply when custom text entered', async () => {
    const user = userEvent.setup();
    renderWithQuery(<MaterialPicker {...defaultProps} />);

    const input = screen.getByPlaceholderText(/marmore carrara/);
    await user.type(input, 'granito preto');

    const applyBtn = screen.getByText('Aplicar');
    expect(applyBtn).not.toBeDisabled();
  });
});
