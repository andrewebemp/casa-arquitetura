import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ObjectRemovalPanel } from '@/components/molecules/ObjectRemovalPanel';
import type { DetectObjectResponse } from '@/services/editing-service';

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

const mockMask: DetectObjectResponse = {
  mask_id: 'mask-1',
  label: 'Entulho',
  mask_polygon: [[0.1, 0.1], [0.2, 0.1], [0.2, 0.2], [0.1, 0.2]],
  confidence: 0.95,
};

describe('ObjectRemovalPanel', () => {
  const defaultProps = {
    projectId: 'proj-1',
    selectedObjects: [] as DetectObjectResponse[],
    onDeselectObject: jest.fn(),
    onClearAll: jest.fn(),
    onClose: jest.fn(),
    onApplied: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows empty state when no objects selected', () => {
    renderWithQuery(<ObjectRemovalPanel {...defaultProps} />);

    expect(screen.getByText(/Clique nos objetos/)).toBeInTheDocument();
    expect(screen.getByText(/ate 10 objetos/)).toBeInTheDocument();
  });

  it('shows selected objects list', () => {
    renderWithQuery(
      <ObjectRemovalPanel {...defaultProps} selectedObjects={[mockMask]} />
    );

    expect(screen.getByText('Entulho')).toBeInTheDocument();
    expect(screen.getByText('Confianca: 95%')).toBeInTheDocument();
  });

  it('shows object count', () => {
    renderWithQuery(
      <ObjectRemovalPanel {...defaultProps} selectedObjects={[mockMask]} />
    );

    expect(screen.getByText('Objetos selecionados (1/10)')).toBeInTheDocument();
  });

  it('shows remove all button with count', () => {
    renderWithQuery(
      <ObjectRemovalPanel {...defaultProps} selectedObjects={[mockMask]} />
    );

    expect(screen.getByText('Remover Todos (1)')).toBeInTheDocument();
  });

  it('calls onDeselectObject when X clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <ObjectRemovalPanel {...defaultProps} selectedObjects={[mockMask]} />
    );

    await user.click(screen.getByLabelText('Desselecionar objeto'));
    expect(defaultProps.onDeselectObject).toHaveBeenCalledWith('mask-1');
  });

  it('calls onClearAll when clear button clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <ObjectRemovalPanel {...defaultProps} selectedObjects={[mockMask]} />
    );

    await user.click(screen.getByText('Limpar tudo'));
    expect(defaultProps.onClearAll).toHaveBeenCalled();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<ObjectRemovalPanel {...defaultProps} />);

    await user.click(screen.getByLabelText('Fechar painel de remocao'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
