'use client';

import { useState, useCallback } from 'react';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';

interface DiagnosticShareProps {
  diagnosticId: string;
  score: number;
}

export function DiagnosticShare({ diagnosticId, score }: DiagnosticShareProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${siteUrl}/diagnostico/${diagnosticId}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const whatsappText = `Meu imovel recebeu nota ${score}/100 no diagnostico de staging da DecorAI! Veja o resultado: ${shareUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        aria-label="Compartilhar Resultado"
      >
        <Share2 className="h-4 w-4" />
        Compartilhar Resultado
      </button>

      {showOptions && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
              copied
                ? 'border-green-300 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            aria-label="Copiar link"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Link copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Link
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
            aria-label="Compartilhar no WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
