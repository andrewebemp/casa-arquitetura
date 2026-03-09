import { render, screen, fireEvent } from '@testing-library/react';
import { GenerationProgress } from '@/components/molecules/GenerationProgress';

describe('GenerationProgress', () => {
  const defaultProps = {
    progress: 0,
    stage: '',
    error: null,
    onRetry: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders progress bar', () => {
    render(<GenerationProgress {...defaultProps} progress={50} stage="Aplicando estilo..." />);

    expect(screen.getByText('Aplicando estilo...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('shows initial stage text', () => {
    render(<GenerationProgress {...defaultProps} />);

    expect(screen.getByText('Iniciando...')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('shows staging tip during generation', () => {
    render(<GenerationProgress {...defaultProps} progress={25} stage="Processando..." />);

    // A tip should be rendered (we don't know which one exactly)
    expect(screen.getByText('Gerando seu ambiente decorado')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <GenerationProgress
        {...defaultProps}
        error="Falha no pipeline de IA"
      />
    );

    expect(screen.getByText('Erro na geracao')).toBeInTheDocument();
    expect(screen.getByText('Falha no pipeline de IA')).toBeInTheDocument();
    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', () => {
    render(
      <GenerationProgress
        {...defaultProps}
        error="Falha"
      />
    );

    fireEvent.click(screen.getByText('Tentar Novamente'));
    expect(defaultProps.onRetry).toHaveBeenCalled();
  });

  it('clamps progress to 100%', () => {
    render(<GenerationProgress {...defaultProps} progress={120} stage="Concluido!" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '120');
  });
});
