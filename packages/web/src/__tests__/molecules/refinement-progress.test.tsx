import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefinementProgress } from '@/components/molecules/RefinementProgress';

describe('RefinementProgress', () => {
  it('renders processing state with stage', () => {
    render(<RefinementProgress stage="trocando piso para madeira clara" progress={45} />);

    expect(screen.getByText('Processando: trocando piso para madeira clara')).toBeInTheDocument();
  });

  it('renders progress bar when progress > 0', () => {
    render(<RefinementProgress stage="Processando" progress={60} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '60');
  });

  it('does not render progress bar at 0', () => {
    render(<RefinementProgress stage="Iniciando" progress={0} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders default stage text when empty', () => {
    render(<RefinementProgress stage="" progress={0} />);

    expect(screen.getByText('Processando: Iniciando...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <RefinementProgress
        stage=""
        progress={0}
        error="Erro no pipeline"
      />
    );

    expect(
      screen.getByText('Nao foi possivel aplicar a alteracao. Tente novamente.')
    ).toBeInTheDocument();
  });

  it('calls onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();

    render(
      <RefinementProgress
        stage=""
        progress={0}
        error="Erro"
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByText('Tentar novamente'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('does not show retry button when onRetry not provided', () => {
    render(
      <RefinementProgress stage="" progress={0} error="Erro" />
    );

    expect(screen.queryByText('Tentar novamente')).not.toBeInTheDocument();
  });
});
