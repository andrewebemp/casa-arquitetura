'use client';

import type { ChatMessage as ChatMessageType } from '@decorai/shared';
import { OperationBadges } from '@/components/atoms/OperationBadges';

interface ChatMessageProps {
  message: ChatMessageType;
  onThumbnailClick?: (versionId: string) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function ChatMessage({ message, onThumbnailClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {!isUser && message.operations && message.operations.length > 0 && (
          <OperationBadges operations={message.operations} />
        )}

        {!isUser && message.version_id && (
          <button
            type="button"
            onClick={() => onThumbnailClick?.(message.version_id!)}
            className="mt-2 block overflow-hidden rounded-lg border border-gray-200 transition-opacity hover:opacity-80"
            aria-label="Ver versao no painel principal"
          >
            <div className="flex h-16 w-24 items-center justify-center bg-gray-50 text-xs text-gray-400">
              Versao
            </div>
          </button>
        )}

        <span
          className={`mt-1 block text-xs ${
            isUser ? 'text-brand-200' : 'text-gray-400'
          }`}
        >
          {formatTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
