import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ProjectWorkspacePage from '@/app/(dashboard)/projects/[id]/page';
import * as chatService from '@/services/chat-service';
import type { ProjectVersion } from '@decorai/shared';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'proj-1' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/chat-service');
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
});
