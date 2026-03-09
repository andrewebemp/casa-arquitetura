import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatMessage } from '@/components/molecules/ChatMessage';
import type { ChatMessage as ChatMessageType } from '@decorai/shared';

describe('ChatMessage', () => {
  const baseMessage: ChatMessageType = {
    id: 'm1',
    project_id: 'p1',
    role: 'user',
    content: 'Muda o piso para madeira',
    operations: null,
    version_id: null,
    created_at: '2026-01-15T10:30:00Z',
  };

  it('renders user message right-aligned with blue bg', () => {
    render(<ChatMessage message={baseMessage} />);

    expect(screen.getByText('Muda o piso para madeira')).toBeInTheDocument();
    const bubble = screen.getByText('Muda o piso para madeira').closest('div');
    expect(bubble?.className).toContain('bg-brand-600');
  });

  it('renders system message left-aligned with gray bg', () => {
    const systemMsg: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Piso alterado para madeira clara',
    };

    render(<ChatMessage message={systemMsg} />);

    const bubble = screen.getByText('Piso alterado para madeira clara').closest('div');
    expect(bubble?.className).toContain('bg-gray-100');
  });

  it('renders operation badges for system messages', () => {
    const systemMsg: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Piso alterado',
      operations: [
        { type: 'change', target: 'piso -> madeira', params: {} },
      ],
    };

    render(<ChatMessage message={systemMsg} />);

    expect(screen.getByText('mudar: piso -> madeira')).toBeInTheDocument();
  });

  it('does not render operations for user messages', () => {
    const userMsg: ChatMessageType = {
      ...baseMessage,
      operations: [
        { type: 'change', target: 'piso', params: {} },
      ],
    };

    render(<ChatMessage message={userMsg} />);

    expect(screen.queryByText('mudar: piso')).not.toBeInTheDocument();
  });

  it('renders thumbnail button when version_id present on system message', async () => {
    const user = userEvent.setup();
    const onThumbnailClick = jest.fn();

    const systemMsg: ChatMessageType = {
      ...baseMessage,
      role: 'assistant',
      content: 'Nova versao gerada',
      version_id: 'v2',
    };

    render(<ChatMessage message={systemMsg} onThumbnailClick={onThumbnailClick} />);

    const btn = screen.getByLabelText('Ver versao no painel principal');
    await user.click(btn);

    expect(onThumbnailClick).toHaveBeenCalledWith('v2');
  });

  it('renders timestamp', () => {
    render(<ChatMessage message={baseMessage} />);

    // Time should be displayed (format depends on locale)
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });
});
