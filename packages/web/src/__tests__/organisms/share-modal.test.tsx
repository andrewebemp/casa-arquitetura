import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ShareModal } from '@/components/organisms/ShareModal';
import * as shareService from '@/services/share-service';
import type { ShareLink } from '@decorai/shared';

jest.mock('@/services/share-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
  }),
}));

const mockedService = shareService as jest.Mocked<typeof shareService>;

const mockShareLink: ShareLink = {
  id: 'share-1',
  project_id: 'proj-1',
  version_id: 'v1',
  share_token: 'tok123',
  include_watermark: false,
  expires_at: null,
  view_count: 5,
  created_at: '2026-01-15T12:00:00Z',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  projectId: 'proj-1',
  projectName: 'Sala Moderna',
  beforeUrl: 'https://example.com/before.jpg',
  afterUrl: 'https://example.com/after.jpg',
  versionId: 'v1',
  isFreeTier: false,
};

describe('ShareModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.getShareLinks.mockResolvedValue([mockShareLink]);
    mockedService.createShareLink.mockResolvedValue(mockShareLink);
    mockedService.deleteShareLink.mockResolvedValue(undefined);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ShareModal {...defaultProps} open={false} />,
      { wrapper: createWrapper() }
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders modal with title when open', async () => {
    render(<ShareModal {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByText('Compartilhar')).toBeInTheDocument();
  });

  it('renders mini slider preview', async () => {
    render(<ShareModal {...defaultProps} />, { wrapper: createWrapper() });

    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('shows share link when available', async () => {
    render(<ShareModal {...defaultProps} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/tok123/)).toBeInTheDocument();
    });
  });

  it('shows watermark warning for free tier', () => {
    render(
      <ShareModal {...defaultProps} isFreeTier={true} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/marca d.agua/)).toBeInTheDocument();
  });

  it('does not show watermark warning for paid tier', () => {
    render(
      <ShareModal {...defaultProps} isFreeTier={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/marca d.agua/)).not.toBeInTheDocument();
  });

  it('shows social share buttons when link exists', async () => {
    render(<ShareModal {...defaultProps} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  it('calls onClose when backdrop clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <ShareModal {...defaultProps} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    const backdrop = document.querySelector('[aria-hidden="true"]')!;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when X button clicked', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    render(
      <ShareModal {...defaultProps} onClose={onClose} />,
      { wrapper: createWrapper() }
    );

    await user.click(screen.getByLabelText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows link management section', async () => {
    const user = userEvent.setup();
    render(<ShareModal {...defaultProps} />, { wrapper: createWrapper() });

    const manageBtn = await screen.findByText(/Gerenciar links/);
    await user.click(manageBtn);

    await waitFor(() => {
      // After expanding, the link list should show delete button
      expect(screen.getByLabelText('Excluir link')).toBeInTheDocument();
    });
  });

  it('has dialog role with aria-modal', () => {
    render(<ShareModal {...defaultProps} />, { wrapper: createWrapper() });

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });
});
