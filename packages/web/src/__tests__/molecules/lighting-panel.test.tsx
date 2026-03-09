import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LightingPanel } from '@/components/molecules/LightingPanel';
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

describe('LightingPanel', () => {
  const defaultProps = {
    projectId: 'proj-1',
    onClose: jest.fn(),
    onApplied: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (editingService.analyzeLighting as jest.Mock).mockResolvedValue({
      brightness_score: 35,
      job_id: 'job-1',
    });
    (editingService.enhanceLighting as jest.Mock).mockResolvedValue({
      job_id: 'job-2',
      version_id: 'v-2',
    });
  });

  it('renders 3 lighting mode cards', () => {
    renderWithQuery(<LightingPanel {...defaultProps} />);

    expect(screen.getByText('Automatico')).toBeInTheDocument();
    expect(screen.getByText('Luz Natural')).toBeInTheDocument();
    expect(screen.getByText('Luz Quente')).toBeInTheDocument();
  });

  it('shows recommended badge on auto mode', () => {
    renderWithQuery(<LightingPanel {...defaultProps} />);

    expect(screen.getByText('Recomendado')).toBeInTheDocument();
  });

  it('renders close button', () => {
    renderWithQuery(<LightingPanel {...defaultProps} />);

    expect(screen.getByLabelText('Fechar painel de iluminacao')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    renderWithQuery(<LightingPanel {...defaultProps} />);

    await user.click(screen.getByLabelText('Fechar painel de iluminacao'));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows dark photo warning when brightness < 40', async () => {
    renderWithQuery(<LightingPanel {...defaultProps} />);

    const warning = await screen.findByText(/foto parece estar escura/);
    expect(warning).toBeInTheDocument();
  });

  it('renders enhance button', () => {
    renderWithQuery(<LightingPanel {...defaultProps} />);

    expect(screen.getByText('Melhorar Iluminacao')).toBeInTheDocument();
  });
});
