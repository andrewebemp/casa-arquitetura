'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

interface PhotoUploaderProps {
  photo: File | null;
  previewUrl: string | null;
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
}

export function PhotoUploader({ photo, previewUrl, onPhotoChange }: PhotoUploaderProps) {
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
        setError('Arquivo muito grande. O tamanho maximo e 20MB.');
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

      const file = e.dataTransfer.files[0];
      if (file) {
        validateAndSetFile(file);
      }
    },
    [validateAndSetFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

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
      <div className="relative">
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          <img
            src={previewUrl}
            alt="Preview do ambiente"
            className="h-64 w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-md transition-colors hover:bg-red-700"
            aria-label="Remover foto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {photo.name} ({(photo.size / (1024 * 1024)).toFixed(1)}MB)
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        aria-label="Area de upload de foto"
      >
        <Upload className={`h-10 w-10 ${isDragging ? 'text-brand-500' : 'text-gray-400'}`} />
        <p className="mt-3 text-sm font-medium text-gray-700">
          Arraste a foto aqui ou clique para enviar
        </p>
        <p className="mt-1 text-xs text-gray-500">JPEG/PNG ate 20MB</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600" role="alert">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
