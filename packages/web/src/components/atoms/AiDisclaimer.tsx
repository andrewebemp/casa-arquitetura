interface AiDisclaimerProps {
  className?: string;
  variant?: 'overlay' | 'inline';
}

export function AiDisclaimer({ className = '', variant = 'inline' }: AiDisclaimerProps) {
  if (variant === 'overlay') {
    return (
      <div className={`absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-xs text-white ${className}`}>
        Imagem ilustrativa gerada por IA
      </div>
    );
  }

  return (
    <p className={`text-xs text-gray-400 ${className}`}>
      Imagem ilustrativa gerada por IA
    </p>
  );
}
