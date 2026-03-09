import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from '@/components/molecules/ToastContainer';
import type { ToastItem } from '@/hooks/use-toast';

describe('ToastContainer', () => {
  const onDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onDismiss={onDismiss} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders toast messages', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Material atualizado com sucesso!', type: 'success' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);
    expect(screen.getByText('Material atualizado com sucesso!')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Sucesso!', type: 'success' },
      { id: '2', message: 'Erro!', type: 'error' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);
    expect(screen.getByText('Sucesso!')).toBeInTheDocument();
    expect(screen.getByText('Erro!')).toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', async () => {
    const user = userEvent.setup();
    const toasts: ToastItem[] = [
      { id: '1', message: 'Test toast', type: 'info' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);
    await user.click(screen.getByLabelText('Fechar notificacao'));
    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('applies correct styles for each toast type', () => {
    const toasts: ToastItem[] = [
      { id: '1', message: 'Success', type: 'success' },
      { id: '2', message: 'Error', type: 'error' },
      { id: '3', message: 'Warning', type: 'warning' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(3);
  });
});
