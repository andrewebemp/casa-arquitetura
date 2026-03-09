import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RenderViewer } from '@/components/molecules/RenderViewer';

describe('RenderViewer', () => {
  const defaultProps = {
    imageUrl: 'https://example.com/render.jpg',
    onToggleHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image when URL provided', () => {
    render(<RenderViewer {...defaultProps} />);

    const img = screen.getByAltText('Render do ambiente');
    expect(img).toHaveAttribute('src', 'https://example.com/render.jpg');
  });

  it('renders placeholder when no image', () => {
    render(<RenderViewer {...defaultProps} imageUrl={null} />);

    expect(screen.getByText('Nenhum render disponivel')).toBeInTheDocument();
  });

  it('renders AI disclaimer overlay', () => {
    render(<RenderViewer {...defaultProps} />);

    expect(screen.getByText('Imagem ilustrativa gerada por IA')).toBeInTheDocument();
  });

  it('renders toolbar action buttons', () => {
    render(<RenderViewer {...defaultProps} />);

    expect(screen.getByLabelText('Trocar Estilo')).toBeInTheDocument();
    expect(screen.getByLabelText('Editar Elementos')).toBeInTheDocument();
    expect(screen.getByLabelText('Comparar Antes/Depois')).toBeInTheDocument();
    expect(screen.getByLabelText('Compartilhar')).toBeInTheDocument();
    expect(screen.getByLabelText('Historico de versoes')).toBeInTheDocument();
  });

  it('calls onToggleHistory when Historico clicked', async () => {
    const user = userEvent.setup();
    render(<RenderViewer {...defaultProps} />);

    await user.click(screen.getByLabelText('Historico de versoes'));

    expect(defaultProps.onToggleHistory).toHaveBeenCalled();
  });
});
