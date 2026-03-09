'use client';

import { useState, useCallback } from 'react';
import { MessageCircle, Mail, Copy, Check } from 'lucide-react';

interface SocialShareButtonsProps {
  shareUrl: string;
  projectName: string;
}

export function SocialShareButtons({ shareUrl, projectName }: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);

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

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Veja a transformacao do ambiente "${projectName}" com staging virtual! ${shareUrl}`
  )}`;

  const emailUrl = `mailto:?subject=${encodeURIComponent(
    `${projectName} — Staging Virtual DecorAI`
  )}&body=${encodeURIComponent(
    `Veja a transformacao do ambiente com staging virtual:\n\n${shareUrl}`
  )}`;

  const btnClass =
    'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors';

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${btnClass} border-green-200 bg-green-50 text-green-700 hover:bg-green-100`}
        aria-label="Compartilhar no WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>

      <a
        href={emailUrl}
        className={`${btnClass} border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100`}
        aria-label="Compartilhar por Email"
      >
        <Mail className="h-4 w-4" />
        Email
      </a>

      <button
        type="button"
        onClick={handleCopy}
        className={`${btnClass} ${
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
    </div>
  );
}
