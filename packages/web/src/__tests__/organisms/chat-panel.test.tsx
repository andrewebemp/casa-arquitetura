import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ChatPanel } from '@/components/organisms/ChatPanel';
import * as chatService from '@/services/chat-service';

jest.mock('@/services/chat-service');
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: null } }) },
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    }),
    removeChannel: jest.fn(),
  }),
}));

const mockedService = chatService as jest.Mocked<typeof chatService>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('ChatPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedService.getChatHistory.mockResolvedValue({
      messages: [],
      next_cursor: null,
      has_more: false,
    });
    mockedService.subscribeToRefinementProgress.mockReturnValue(jest.fn());
  });

  it('renders empty state', async () => {
    render(
      <ChatPanel projectId="p1" />,
      { wrapper: createWrapper() }
    );

    expect(await screen.findByText('Envie uma mensagem para refinar seu render')).toBeInTheDocument();
  });

  it('renders chat header', () => {
    render(
      <ChatPanel projectId="p1" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Chat de Refinamento')).toBeInTheDocument();
  });

  it('renders input field', () => {
    render(
      <ChatPanel projectId="p1" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByPlaceholderText('Descreva a alteracao desejada...')).toBeInTheDocument();
  });

  it('shows quick suggestions when no messages', () => {
    render(
      <ChatPanel projectId="p1" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Mais aconchegante')).toBeInTheDocument();
  });

  it('renders messages when history exists', async () => {
    mockedService.getChatHistory.mockResolvedValue({
      messages: [
        {
          id: 'm1',
          project_id: 'p1',
          role: 'user',
          content: 'Muda o piso',
          operations: null,
          version_id: null,
          created_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 'm2',
          project_id: 'p1',
          role: 'assistant',
          content: 'Piso alterado',
          operations: [{ type: 'change', target: 'piso', params: {} }],
          version_id: 'v1',
          created_at: '2026-01-01T00:01:00Z',
        },
      ],
      next_cursor: null,
      has_more: false,
    });

    render(
      <ChatPanel projectId="p1" />,
      { wrapper: createWrapper() }
    );

    expect(await screen.findByText('Muda o piso')).toBeInTheDocument();
    expect(await screen.findByText('Piso alterado')).toBeInTheDocument();
  });

  it('sends message on submit', async () => {
    const user = userEvent.setup();
    mockedService.sendMessage.mockResolvedValue({
      id: 'm-new',
      project_id: 'p1',
      role: 'assistant',
      content: 'Ok, alterando...',
      operations: null,
      version_id: null,
      created_at: new Date().toISOString(),
    });

    render(
      <ChatPanel projectId="p1" />,
      { wrapper: createWrapper() }
    );

    const input = screen.getByPlaceholderText('Descreva a alteracao desejada...');
    await user.type(input, 'tira o tapete{Enter}');

    await waitFor(() => {
      expect(mockedService.sendMessage).toHaveBeenCalledWith('p1', 'tira o tapete');
    });
  });
});
