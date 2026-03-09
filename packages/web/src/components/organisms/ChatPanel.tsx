'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage as ChatMessageType } from '@decorai/shared';
import { ChatMessage } from '@/components/molecules/ChatMessage';
import { ChatInput } from '@/components/molecules/ChatInput';
import { QuickSuggestions } from '@/components/molecules/QuickSuggestions';
import { RefinementProgress } from '@/components/molecules/RefinementProgress';
import { getChatHistory, sendMessage } from '@/services/chat-service';
import { useRefinementProgress } from '@/hooks/use-refinement-progress';
import { MessageSquare } from 'lucide-react';

interface ChatPanelProps {
  projectId: string;
  onVersionSelect?: (versionId: string) => void;
  onNewVersion?: () => void;
}

export function ChatPanel({ projectId, onVersionSelect, onNewVersion }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [lastRetryMessage, setLastRetryMessage] = useState('');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['chat-history', projectId],
    queryFn: ({ pageParam }) => getChatHistory(projectId, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
  });

  const allMessages = data?.pages.flatMap((page) => page.messages).reverse() ?? [];

  const sendMutation = useMutation({
    mutationFn: (message: string) => sendMessage(projectId, message),
    onMutate: async (message: string) => {
      setIsRefining(true);

      const optimisticMessage: ChatMessageType = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        role: 'user',
        content: message,
        operations: null,
        version_id: null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(['chat-history', projectId], (old: unknown) => {
        const typedOld = old as { pages: Array<{ messages: ChatMessageType[]; next_cursor: string | null }> } | undefined;
        if (!typedOld) return { pages: [{ messages: [optimisticMessage], next_cursor: null }], pageParams: [undefined] };

        const pages = [...typedOld.pages];
        pages[0] = { ...pages[0], messages: [optimisticMessage, ...pages[0].messages] };
        return { ...typedOld, pages };
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history', projectId] });
    },
    onError: () => {
      setIsRefining(false);
      queryClient.invalidateQueries({ queryKey: ['chat-history', projectId] });
    },
  });

  const refinementState = useRefinementProgress({
    projectId,
    enabled: isRefining,
    onComplete: () => {
      setIsRefining(false);
      queryClient.invalidateQueries({ queryKey: ['chat-history', projectId] });
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
      onNewVersion?.();
    },
    onError: () => {
      setIsRefining(false);
    },
  });

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length, refinementState.isRefining]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleSend(message: string) {
    setLastRetryMessage(message);
    sendMutation.mutate(message);
  }

  function handleRetry() {
    if (lastRetryMessage) {
      sendMutation.mutate(lastRetryMessage);
    }
  }

  function handleSuggestionSelect(text: string) {
    setInputValue(text);
  }

  const showSuggestions = allMessages.length < 3;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <MessageSquare className="h-4 w-4" />
          Chat de Refinamento
        </h2>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {isFetchingNextPage && (
          <div className="mb-4 text-center text-xs text-gray-400">
            Carregando mensagens anteriores...
          </div>
        )}

        {allMessages.length === 0 && !refinementState.isRefining && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageSquare className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">
              Envie uma mensagem para refinar seu render
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Ex: &quot;deixa mais aconchegante&quot; ou &quot;tira o tapete&quot;
            </p>
          </div>
        )}

        <div className="space-y-3">
          {allMessages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onThumbnailClick={onVersionSelect}
            />
          ))}

          {refinementState.isRefining && (
            <RefinementProgress
              stage={refinementState.stage}
              progress={refinementState.progress}
            />
          )}

          {refinementState.error && (
            <RefinementProgress
              stage=""
              progress={0}
              error={refinementState.error}
              onRetry={handleRetry}
            />
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      <QuickSuggestions
        visible={showSuggestions}
        onSelect={handleSuggestionSelect}
      />

      <ChatInput
        onSend={handleSend}
        disabled={isRefining || sendMutation.isPending}
      />
    </div>
  );
}
