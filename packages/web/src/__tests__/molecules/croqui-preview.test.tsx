import { render, screen, fireEvent } from '@testing-library/react';
import { CroquiPreview } from '@/components/molecules/CroquiPreview';

describe('CroquiPreview', () => {
  const defaultProps = {
    croquiAscii: null,
    isGenerating: false,
    isIterating: false,
    onIterate: jest.fn(),
    onApprove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading when generating', () => {
    render(<CroquiPreview {...defaultProps} isGenerating={true} />);

    expect(screen.getByText('Gerando croqui do ambiente...')).toBeInTheDocument();
  });

  it('shows waiting message when no croqui', () => {
    render(<CroquiPreview {...defaultProps} />);

    expect(screen.getByText('Aguardando geracao do croqui...')).toBeInTheDocument();
  });

  it('renders ASCII croqui in monospace', () => {
    const ascii = '+---+\n| S |\n+---+';
    render(<CroquiPreview {...defaultProps} croquiAscii={ascii} />);

    const pre = document.querySelector('pre');
    expect(pre).toBeInTheDocument();
    expect(pre).toHaveClass('font-mono');
    expect(pre?.textContent).toContain('+---+');
    expect(pre?.textContent).toContain('| S |');
  });

  it('shows iterate and approve buttons', () => {
    render(<CroquiPreview {...defaultProps} croquiAscii="+---+" />);

    expect(screen.getByText('Ajustar')).toBeInTheDocument();
    expect(screen.getByText('Aprovar e Gerar Imagem')).toBeInTheDocument();
  });

  it('calls onIterate with feedback text', () => {
    render(<CroquiPreview {...defaultProps} croquiAscii="+---+" />);

    const textarea = screen.getByLabelText('Ajustes (opcional)');
    fireEvent.change(textarea, { target: { value: 'mova o sofa' } });

    fireEvent.click(screen.getByText('Ajustar'));
    expect(defaultProps.onIterate).toHaveBeenCalledWith('mova o sofa');
  });

  it('disables Ajustar button when no feedback', () => {
    render(<CroquiPreview {...defaultProps} croquiAscii="+---+" />);

    const adjustButton = screen.getByText('Ajustar');
    expect(adjustButton).toBeDisabled();
  });

  it('calls onApprove when approve clicked', () => {
    render(<CroquiPreview {...defaultProps} croquiAscii="+---+" />);

    fireEvent.click(screen.getByText('Aprovar e Gerar Imagem'));
    expect(defaultProps.onApprove).toHaveBeenCalled();
  });

  it('disables buttons when iterating', () => {
    render(<CroquiPreview {...defaultProps} croquiAscii="+---+" isIterating={true} />);

    expect(screen.getByText('Aprovar e Gerar Imagem')).toBeDisabled();
  });
});
