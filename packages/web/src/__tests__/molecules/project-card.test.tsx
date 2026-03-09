import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import type { Project } from '@decorai/shared';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

jest.mock('next/image', () => {
  return function MockImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  };
});

const mockProject: Project = {
  id: 'proj-1',
  user_id: 'user-1',
  name: 'Sala Moderna',
  input_type: 'photo',
  style: 'moderno',
  status: 'ready',
  is_favorite: false,
  original_image_url: 'https://example.com/img.jpg',
  room_type: 'sala',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-15T10:30:00Z',
};

const defaultProps = {
  project: mockProject,
  onToggleFavorite: jest.fn(),
  onDuplicate: jest.fn(),
  onDelete: jest.fn(),
  onShare: jest.fn(),
};

describe('ProjectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders project name and style', () => {
    render(<ProjectCard {...defaultProps} />);

    expect(screen.getByText('Sala Moderna')).toBeInTheDocument();
    expect(screen.getByText('moderno')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<ProjectCard {...defaultProps} />);

    expect(screen.getByText('Pronto')).toBeInTheDocument();
  });

  it('renders thumbnail image', () => {
    render(<ProjectCard {...defaultProps} />);

    const img = screen.getByAltText('Sala Moderna');
    expect(img).toHaveAttribute('src', 'https://example.com/img.jpg');
  });

  it('renders placeholder when no image', () => {
    render(
      <ProjectCard
        {...defaultProps}
        project={{ ...mockProject, original_image_url: null }}
      />
    );

    expect(screen.getByText('Sem imagem')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when heart clicked', async () => {
    const user = userEvent.setup();
    render(<ProjectCard {...defaultProps} />);

    const favButton = screen.getByLabelText('Adicionar aos favoritos');
    await user.click(favButton);

    expect(defaultProps.onToggleFavorite).toHaveBeenCalledWith('proj-1', true);
  });

  it('shows remove label when already favorite', () => {
    render(
      <ProjectCard
        {...defaultProps}
        project={{ ...mockProject, is_favorite: true }}
      />
    );

    expect(screen.getByLabelText('Remover dos favoritos')).toBeInTheDocument();
  });

  it('shows action menu on click', async () => {
    const user = userEvent.setup();
    render(<ProjectCard {...defaultProps} />);

    const menuButton = screen.getByLabelText('Acoes do projeto');
    await user.click(menuButton);

    expect(screen.getByText('Abrir')).toBeInTheDocument();
    expect(screen.getByText('Duplicar')).toBeInTheDocument();
    expect(screen.getByText('Compartilhar')).toBeInTheDocument();
    expect(screen.getByText('Excluir')).toBeInTheDocument();
  });

  it('calls onDuplicate from action menu', async () => {
    const user = userEvent.setup();
    render(<ProjectCard {...defaultProps} />);

    await user.click(screen.getByLabelText('Acoes do projeto'));
    await user.click(screen.getByText('Duplicar'));

    expect(defaultProps.onDuplicate).toHaveBeenCalledWith('proj-1');
  });

  it('calls onDelete from action menu', async () => {
    const user = userEvent.setup();
    render(<ProjectCard {...defaultProps} />);

    await user.click(screen.getByLabelText('Acoes do projeto'));
    await user.click(screen.getByText('Excluir'));

    expect(defaultProps.onDelete).toHaveBeenCalledWith('proj-1');
  });
});
