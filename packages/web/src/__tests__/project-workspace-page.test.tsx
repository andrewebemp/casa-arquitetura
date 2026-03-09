import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ProjectWorkspacePage from '@/app/(dashboard)/projects/[id]/page';
import * as chatService from '@/services/chat-service';
import * as editingService from '@/services/editing-service';
import type { ProjectVersion } from '@decorai/shared';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'proj-1' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/chat-service');
jest.mock('@/services/editing-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    }),
    removeChannel: jest.fn(),
  }),
}));

const mockedService = chatService as jest.Mocked<typeof chatService>;
const mockedEditingService = editingService as jest.Mocked<typeof editingService>;

const mockVersion: ProjectVersion = {
  id: 'v1',
  project_id: 'proj-1',
  version_number: 1,
  image_url: 'https://example.com/render.jpg',
  thumbnail_url: 'https://example.com/thumb.jpg',
  prompt: 'moderno',
  refinement_command: null,
  quality_scores: null,
  metadata: {
    depth_map_url: null,
    conditioning_params: {},
    gpu_provider: 'fal.ai',
    generation_time_ms: 5000,
    cost_cents: 10,
    resolution: { width: 1024, height: 1024 },
  },
  created_at: new Date().toISOString(),
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('ProjectWorkspacePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.getVersions.mockResolvedValue([mockVersion]);
    mockedService.getChatHistory.mockResolvedValue({
      messages: [],
      next_cursor: null,
      has_more: false,
    });
    mockedService.subscribeToRefinementProgress.mockReturnValue(jest.fn());
    mockedEditingService.getQuota.mockResolvedValue({
      renders_remaining: 10,
      renders_limit: 20,
      renders_used: 10,
      tier: 'pro',
    });
    mockedEditingService.getEditHistory.mockResolvedValue([]);
    mockedEditingService.analyzeLighting.mockResolvedValue({
      brightness_score: 65,
      job_id: 'job-1',
    });
    mockedEditingService.subscribeToEditingProgress.mockReturnValue(jest.fn());
  });

  it('renders two-panel layout', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    // Render viewer
    expect(await screen.findByAltText('Render do ambiente')).toBeInTheDocument();
    // Chat panel
    expect(screen.getByText('Chat de Refinamento')).toBeInTheDocument();
  });

  it('displays latest render image', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const img = await screen.findByAltText('Render do ambiente');
    expect(img).toHaveAttribute('src', 'https://example.com/render.jpg');
  });

  it('shows AI disclaimer', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Imagem ilustrativa gerada por IA')).toBeInTheDocument();
  });

  it('shows toolbar actions', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    expect(await screen.findByLabelText('Trocar Estilo')).toBeInTheDocument();
    expect(screen.getByLabelText('Compartilhar')).toBeInTheDocument();
    expect(screen.getByLabelText('Historico de versoes')).toBeInTheDocument();
  });

  it('opens version history when Historico clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const historyBtn = await screen.findByLabelText('Historico de versoes');
    await user.click(historyBtn);

    expect(await screen.findByText('Historico de Versoes')).toBeInTheDocument();
  });

  it('shows chat input', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    expect(
      await screen.findByPlaceholderText('Descreva a alteracao desejada...')
    ).toBeInTheDocument();
  });

  it('shows quick suggestions when chat is empty', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    expect(await screen.findByText('Mais aconchegante')).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    mockedService.getVersions.mockReturnValue(new Promise(() => {}));

    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    // Should show loading spinner (Loader2 icon)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('enters edit mode when Editar Elementos clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const editBtn = await screen.findByLabelText('Editar Elementos');
    await user.click(editBtn);

    // Editing toolbar should appear with all 3 tools
    expect(await screen.findByLabelText('Segmentar Elementos')).toBeInTheDocument();
    expect(screen.getByLabelText('Iluminacao')).toBeInTheDocument();
    expect(screen.getByLabelText('Remover Objetos')).toBeInTheDocument();
    expect(screen.getByLabelText('Sair da Edicao')).toBeInTheDocument();
  });

  it('exits edit mode when Sair da Edicao clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    // Enter edit mode
    const editBtn = await screen.findByLabelText('Editar Elementos');
    await user.click(editBtn);

    // Exit edit mode
    const exitBtn = await screen.findByLabelText('Sair da Edicao');
    await user.click(exitBtn);

    // Should be back to normal view with toolbar
    expect(await screen.findByLabelText('Editar Elementos')).toBeInTheDocument();
    expect(screen.queryByLabelText('Sair da Edicao')).not.toBeInTheDocument();
  });

  it('shows quota indicator in edit mode', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const editBtn = await screen.findByLabelText('Editar Elementos');
    await user.click(editBtn);

    expect(await screen.findByText(/Creditos restantes/)).toBeInTheDocument();
  });

  it('shows Detectar Todos button when segment tool active', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const editBtn = await screen.findByLabelText('Editar Elementos');
    await user.click(editBtn);

    // Segment tool is active by default on enter
    expect(await screen.findByText('Detectar Todos')).toBeInTheDocument();
  });

  it('switches to lighting tool and shows panel', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const editBtn = await screen.findByLabelText('Editar Elementos');
    await user.click(editBtn);

    // Switch to lighting tool
    const lightingBtn = screen.getByLabelText('Iluminacao');
    await user.click(lightingBtn);

    // Lighting panel should appear (look for panel-specific content)
    expect(await screen.findByText('Selecione o modo')).toBeInTheDocument();
    expect(screen.queryByText('Detectar Todos')).not.toBeInTheDocument();
  });

  it('switches to removal tool and shows empty state', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const editBtn = await screen.findByLabelText('Editar Elementos');
    await user.click(editBtn);

    // Switch to removal tool
    const removeBtn = screen.getByLabelText('Remover Objetos');
    await user.click(removeBtn);

    // Object removal panel empty state
    expect(await screen.findByText('Clique nos objetos na imagem para seleciona-los')).toBeInTheDocument();
  });
});
