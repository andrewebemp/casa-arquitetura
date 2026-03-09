import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ProjectWorkspacePage from '@/app/(dashboard)/projects/[id]/page';
import * as chatService from '@/services/chat-service';
import * as shareService from '@/services/share-service';
import type { ProjectVersion } from '@decorai/shared';

jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'proj-1' }),
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/services/chat-service');
jest.mock('@/services/share-service');
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

const mockedChat = chatService as jest.Mocked<typeof chatService>;
const mockedShare = shareService as jest.Mocked<typeof shareService>;

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

describe('Workspace Toolbar Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedChat.getVersions.mockResolvedValue([mockVersion]);
    mockedChat.getChatHistory.mockResolvedValue({
      messages: [],
      next_cursor: null,
      has_more: false,
    });
    mockedChat.subscribeToRefinementProgress.mockReturnValue(jest.fn());
    mockedShare.getSliderData.mockResolvedValue({
      original_url: 'https://example.com/before.jpg',
      rendered_url: 'https://example.com/after.jpg',
      version_id: 'v1',
      project_name: 'Sala Moderna',
      style: 'Moderno',
      created_at: new Date().toISOString(),
    });
    mockedShare.getShareLinks.mockResolvedValue([]);
    mockedShare.createShareLink.mockResolvedValue({
      id: 'share-1',
      project_id: 'proj-1',
      version_id: 'v1',
      share_token: 'tok123',
      include_watermark: false,
      expires_at: null,
      view_count: 0,
      created_at: new Date().toISOString(),
    });
  });

  it('opens slider overlay when Comparar button clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const compareBtn = await screen.findByLabelText('Comparar Antes/Depois');
    await user.click(compareBtn);

    await waitFor(() => {
      // Overlay has a close button specific to the comparison view
      expect(screen.getByLabelText('Fechar comparacao')).toBeInTheDocument();
    });
  });

  it('closes slider overlay when X button clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const compareBtn = await screen.findByLabelText('Comparar Antes/Depois');
    await user.click(compareBtn);

    await waitFor(() => {
      expect(screen.getByLabelText('Fechar comparacao')).toBeInTheDocument();
    });

    const closeBtn = screen.getByLabelText('Fechar comparacao');
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByLabelText('Fechar comparacao')).not.toBeInTheDocument();
    });
  });

  it('opens share modal when Compartilhar button clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const shareBtn = await screen.findByLabelText('Compartilhar');
    await user.click(shareBtn);

    await waitFor(() => {
      // The share modal has a dialog role
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('slider overlay shows BeforeAfterSlider component', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const compareBtn = await screen.findByLabelText('Comparar Antes/Depois');
    await user.click(compareBtn);

    await waitFor(() => {
      // The slider overlay should contain the slider with ANTES/DEPOIS labels
      expect(screen.getByText('ANTES')).toBeInTheDocument();
      expect(screen.getByText('DEPOIS')).toBeInTheDocument();
    });
  });

  it('share modal shows social share buttons', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const shareBtn = await screen.findByLabelText('Compartilhar');
    await user.click(shareBtn);

    await waitFor(() => {
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });
});
