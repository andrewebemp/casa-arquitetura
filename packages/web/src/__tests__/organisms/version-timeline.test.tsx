import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { VersionTimeline } from '@/components/organisms/VersionTimeline';
import * as chatService from '@/services/chat-service';
import type { ProjectVersion } from '@decorai/shared';

jest.mock('@/services/chat-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockedService = chatService as jest.Mocked<typeof chatService>;

const mockVersions: ProjectVersion[] = [
  {
    id: 'v2',
    project_id: 'p1',
    version_number: 2,
    image_url: 'https://example.com/v2.jpg',
    thumbnail_url: 'https://example.com/v2-thumb.jpg',
    prompt: 'modern',
    refinement_command: 'mudar piso',
    quality_scores: null,
    metadata: {
      depth_map_url: null,
      conditioning_params: {},
      gpu_provider: 'fal.ai',
      generation_time_ms: 5000,
      cost_cents: 10,
      resolution: { width: 1024, height: 1024 },
    },
    created_at: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'v1',
    project_id: 'p1',
    version_number: 1,
    image_url: 'https://example.com/v1.jpg',
    thumbnail_url: 'https://example.com/v1-thumb.jpg',
    prompt: 'modern',
    refinement_command: null,
    quality_scores: null,
    metadata: {
      depth_map_url: null,
      conditioning_params: {},
      gpu_provider: 'fal.ai',
      generation_time_ms: 8000,
      cost_cents: 15,
      resolution: { width: 1024, height: 1024 },
    },
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('VersionTimeline', () => {
  const defaultProps = {
    projectId: 'p1',
    currentVersionId: 'v2',
    open: true,
    onClose: jest.fn(),
    onPreview: jest.fn(),
    onReverted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.getVersions.mockResolvedValue(mockVersions);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <VersionTimeline {...defaultProps} open={false} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders version cards when open', async () => {
    render(
      <VersionTimeline {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    expect(await screen.findByText('v2')).toBeInTheDocument();
    expect(await screen.findByText('v1')).toBeInTheDocument();
  });

  it('marks current version as active', async () => {
    render(
      <VersionTimeline {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    expect(await screen.findByText('Atual')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(
      <VersionTimeline {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByLabelText('Fechar historico'));

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('shows confirmation dialog on revert click', async () => {
    const user = userEvent.setup();
    render(
      <VersionTimeline {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    const restoreBtn = await screen.findByText('Restaurar esta versao');
    await user.click(restoreBtn);

    expect(screen.getByText(/Restaurar versao v1\?/)).toBeInTheDocument();
    expect(screen.getByText('Uma nova versao sera criada a partir desta.')).toBeInTheDocument();
  });

  it('calls revertVersion on confirm', async () => {
    const user = userEvent.setup();
    mockedService.revertVersion.mockResolvedValue(mockVersions[0]);

    render(
      <VersionTimeline {...defaultProps} />,
      { wrapper: createWrapper() }
    );

    const restoreBtn = await screen.findByText('Restaurar esta versao');
    await user.click(restoreBtn);

    const confirmBtn = screen.getByRole('dialog', { name: 'Confirmar restauracao' })
      .querySelector('button:last-of-type')!;
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(mockedService.revertVersion).toHaveBeenCalledWith('p1', 'v1');
    });
  });
});
