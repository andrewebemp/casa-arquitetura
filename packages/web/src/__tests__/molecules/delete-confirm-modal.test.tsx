import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from '@/components/molecules/DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    open: true,
    projectName: 'Sala Moderna',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <DeleteConfirmModal {...defaultProps} open={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders PT-BR confirmation text', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('Excluir projeto')).toBeInTheDocument();
    expect(screen.getByText(/Tem certeza/)).toBeInTheDocument();
    expect(screen.getByText('Sala Moderna')).toBeInTheDocument();
  });

  it('calls onCancel when Cancelar clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} />);

    await user.click(screen.getByText('Cancelar'));

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('calls onConfirm when Excluir clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} />);

    await user.click(screen.getByText('Excluir'));

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('shows loading state when deleting', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting />);

    expect(screen.getByText('Excluindo...')).toBeInTheDocument();
  });
});
