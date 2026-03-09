import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VersionCard } from '@/components/molecules/VersionCard';
import type { ProjectVersion } from '@decorai/shared';

describe('VersionCard', () => {
  const baseVersion: ProjectVersion = {
    id: 'v1',
    project_id: 'p1',
    version_number: 2,
    image_url: 'https://example.com/v2.jpg',
    thumbnail_url: 'https://example.com/v2-thumb.jpg',
    prompt: 'test prompt',
    refinement_command: 'mudar piso para madeira',
    quality_scores: null,
    metadata: {
      depth_map_url: null,
      conditioning_params: {},
      gpu_provider: 'fal.ai',
      generation_time_ms: 5000,
      cost_cents: 10,
      resolution: { width: 1024, height: 1024 },
    },
    created_at: new Date(Date.now() - 300000).toISOString(), // 5 min ago
  };

  const defaultProps = {
    version: baseVersion,
    isActive: false,
    onPreview: jest.fn(),
    onRevert: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders version number and description', () => {
    render(<VersionCard {...defaultProps} />);

    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('mudar piso para madeira')).toBeInTheDocument();
  });

  it('shows "Atual" badge when active', () => {
    render(<VersionCard {...defaultProps} isActive />);

    expect(screen.getByText('Atual')).toBeInTheDocument();
  });

  it('hides restore button when active', () => {
    render(<VersionCard {...defaultProps} isActive />);

    expect(screen.queryByText('Restaurar esta versao')).not.toBeInTheDocument();
  });

  it('shows restore button when not active', () => {
    render(<VersionCard {...defaultProps} />);

    expect(screen.getByText('Restaurar esta versao')).toBeInTheDocument();
  });

  it('calls onRevert when restore clicked', async () => {
    const user = userEvent.setup();
    render(<VersionCard {...defaultProps} />);

    await user.click(screen.getByText('Restaurar esta versao'));

    expect(defaultProps.onRevert).toHaveBeenCalledWith(baseVersion);
  });

  it('calls onPreview when thumbnail clicked', async () => {
    const user = userEvent.setup();
    render(<VersionCard {...defaultProps} />);

    await user.click(screen.getByLabelText('Visualizar versao v2'));

    expect(defaultProps.onPreview).toHaveBeenCalledWith(baseVersion);
  });

  it('shows relative time', () => {
    render(<VersionCard {...defaultProps} />);

    expect(screen.getByText(/ha \d+ minuto/)).toBeInTheDocument();
  });

  it('shows "Versao inicial" when no refinement_command', () => {
    const initialVersion = { ...baseVersion, refinement_command: null };
    render(<VersionCard {...defaultProps} version={initialVersion} />);

    expect(screen.getByText('Versao inicial')).toBeInTheDocument();
  });
});
