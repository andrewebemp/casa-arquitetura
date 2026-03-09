import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareLinkList } from '@/components/molecules/ShareLinkList';
import type { ShareLink } from '@decorai/shared';

const mockLink: ShareLink = {
  id: 'link-1',
  project_id: 'proj-1',
  version_id: 'v1',
  share_token: 'abc123',
  include_watermark: false,
  expires_at: null,
  view_count: 42,
  created_at: '2026-01-15T12:00:00Z',
};

const expiredLink: ShareLink = {
  ...mockLink,
  id: 'link-2',
  share_token: 'expired456',
  expires_at: '2025-01-01T00:00:00Z',
  view_count: 10,
};

describe('ShareLinkList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty message when no links', () => {
    render(<ShareLinkList links={[]} onDelete={jest.fn()} />);

    expect(screen.getByText('Nenhum link de compartilhamento ativo.')).toBeInTheDocument();
  });

  it('renders link URL with share token', () => {
    render(<ShareLinkList links={[mockLink]} onDelete={jest.fn()} />);

    expect(screen.getByText(/abc123/)).toBeInTheDocument();
  });

  it('renders view count', () => {
    render(<ShareLinkList links={[mockLink]} onDelete={jest.fn()} />);

    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('renders creation date in pt-BR format', () => {
    render(<ShareLinkList links={[mockLink]} onDelete={jest.fn()} />);

    expect(screen.getByText('15/01/2026')).toBeInTheDocument();
  });

  it('shows expired badge for expired links', () => {
    render(<ShareLinkList links={[expiredLink]} onDelete={jest.fn()} />);

    expect(screen.getByText('Expirado')).toBeInTheDocument();
  });

  it('requires double click to delete', async () => {
    const onDelete = jest.fn();
    const user = userEvent.setup();
    render(<ShareLinkList links={[mockLink]} onDelete={onDelete} />);

    const deleteBtn = screen.getByLabelText('Excluir link');
    await user.click(deleteBtn);
    expect(onDelete).not.toHaveBeenCalled();

    await user.click(screen.getByLabelText('Confirmar exclusao'));
    expect(onDelete).toHaveBeenCalledWith('link-1');
  });

  it('shows loading state when deleting', () => {
    render(
      <ShareLinkList links={[mockLink]} onDelete={jest.fn()} isDeleting={true} />
    );

    const deleteBtn = screen.getByLabelText('Excluir link');
    expect(deleteBtn).toBeDisabled();
  });

  it('opens link in new tab', () => {
    render(<ShareLinkList links={[mockLink]} onDelete={jest.fn()} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('shows expiration date when set', () => {
    const linkWithExpiry: ShareLink = {
      ...mockLink,
      expires_at: '2026-12-15T12:00:00Z',
    };

    render(<ShareLinkList links={[linkWithExpiry]} onDelete={jest.fn()} />);

    expect(screen.getByText(/Expira: \d{2}\/\d{2}\/2026/)).toBeInTheDocument();
  });

  it('shows singular form for 1 view', () => {
    const singleViewLink: ShareLink = { ...mockLink, view_count: 1 };
    render(<ShareLinkList links={[singleViewLink]} onDelete={jest.fn()} />);

    expect(screen.getByText(/1 visualizacao$/)).toBeInTheDocument();
  });
});
