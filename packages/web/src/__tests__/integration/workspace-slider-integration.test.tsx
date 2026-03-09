import { render, screen } from '@testing-library/react';
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

const mockedChatService = chatService as jest.Mocked<typeof chatService>;
const mockedShareService = shareService as jest.Mocked<typeof shareService>;

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

const mockSliderData: shareService.SliderData = {
  original_url: 'https://example.com/original.jpg',
  rendered_url: 'https://example.com/render.jpg',
  version_id: 'v1',
  project_name: 'Sala Moderna',
  style: 'Moderno',
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

describe('Workspace Slider Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedChatService.getVersions.mockResolvedValue([mockVersion]);
    mockedChatService.getChatHistory.mockResolvedValue({
      messages: [],
      next_cursor: null,
      has_more: false,
    });
    mockedChatService.subscribeToRefinementProgress.mockReturnValue(jest.fn());
    mockedShareService.getSliderData.mockResolvedValue(mockSliderData);
    mockedShareService.getShareLinks.mockResolvedValue([]);
    mockedShareService.createShareLink.mockResolvedValue({
      id: 'share-1',
      share_token: 'test-token',
      project_id: 'proj-1',
      version_id: 'v1',
      include_watermark: false,
      expires_at: null,
      view_count: 0,
      created_at: new Date().toISOString(),
    });
  });

  it('Comparar button is present in toolbar', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const btn = await screen.findByLabelText('Comparar Antes/Depois');
    expect(btn).toBeInTheDocument();
  });

  it('Compartilhar button is present in toolbar', async () => {
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const btn = await screen.findByLabelText('Compartilhar');
    expect(btn).toBeInTheDocument();
  });

  it('clicking Compartilhar opens share modal', async () => {
    const user = userEvent.setup();
    render(<ProjectWorkspacePage />, { wrapper: createWrapper() });

    const btn = await screen.findByLabelText('Compartilhar');
    await user.click(btn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });
});
