import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '@/components/molecules/ChatInput';

describe('ChatInput', () => {
  const defaultProps = {
    onSend: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input with PT-BR placeholder', () => {
    render(<ChatInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Descreva a alteracao desejada...')).toBeInTheDocument();
  });

  it('sends message on button click', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'muda o piso');
    await user.click(screen.getByLabelText('Enviar mensagem'));

    expect(defaultProps.onSend).toHaveBeenCalledWith('muda o piso');
  });

  it('sends message on Enter key', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'tira o tapete{Enter}');

    expect(defaultProps.onSend).toHaveBeenCalledWith('tira o tapete');
  });

  it('clears input after sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    const input = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(input, 'test{Enter}');

    expect(input.value).toBe('');
  });

  it('does not send empty message', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    await user.click(screen.getByLabelText('Enviar mensagem'));

    expect(defaultProps.onSend).not.toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(<ChatInput {...defaultProps} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByLabelText('Enviar mensagem')).toBeDisabled();
  });

  it('trims whitespace before sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput {...defaultProps} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '  muda cor  {Enter}');

    expect(defaultProps.onSend).toHaveBeenCalledWith('muda cor');
  });
});
