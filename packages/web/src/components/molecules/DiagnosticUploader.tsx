'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

interface DiagnosticUploaderProps {
  photo: File | null;
  previewUrl: string | null;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
}

export function DiagnosticUploader({
  photo,
  previewUrl,
  onPhotoChange,
  disabled = false,
}: DiagnosticUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = useCallback(
    (file: File) => {
      setError(null);

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Formato invalido. Envie apenas JPEG ou PNG.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError('Arquivo muito grande. O tamanho maximo e 10MB.');
        return;
      }

      const url = URL.createObjectURL(file);
      onPhotoChange(file, url);
    },
    [onPhotoChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    },
    [validateAndSetFile, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        validateAndSetFile(file);
      }
    },
    [validateAndSetFile]
  );

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onPhotoChange(null, null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl, onPhotoChange]);

  if (photo && previewUrl) {
    return (
      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          <img
            src={previewUrl}
            alt="Preview da foto do imovel"
            className="h-64 w-full object-cover md:h-80"
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-md transition-colors hover:bg-red-700"
              aria-label="Remover foto"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {photo.name} ({(photo.size / (1024 * 1024)).toFixed(1)}MB)
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors md:p-12 ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
            : isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        aria-label="Area de upload de foto do imovel"
      >
        <Upload className={`h-10 w-10 ${isDragging ? 'text-brand-500' : 'text-gray-400'}`} />
        <p className="mt-3 text-center text-sm font-medium text-gray-700">
          Arraste a foto do seu imovel aqui ou clique para enviar
        </p>
        <p className="mt-1 text-xs text-gray-500">JPEG/PNG ate 10MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        disabled={disabled}
      />

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
