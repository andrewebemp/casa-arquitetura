'use client';

import { useRef } from 'react';
import { Plus, Trash2, ImageIcon } from 'lucide-react';
import type { ReferenceItemInput } from '@/hooks/use-new-project-wizard';

interface ReferenceItemListProps {
  items: ReferenceItemInput[];
  onAddItem: () => void;
  onUpdateItem: (index: number, updates: Partial<ReferenceItemInput>) => void;
  onRemoveItem: (index: number) => void;
}

function ReferenceItemRow({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: ReferenceItemInput;
  index: number;
  onUpdate: (index: number, updates: Partial<ReferenceItemInput>) => void;
  onRemove: (index: number) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onUpdate(index, { photo: file, photoPreviewUrl: previewUrl });
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
      <div className="flex-shrink-0">
        {item.photoPreviewUrl ? (
          <img
            src={item.photoPreviewUrl}
            alt={item.name || 'Referencia'}
            className="h-16 w-16 rounded-md object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 w-16 items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500"
            aria-label="Adicionar foto de referencia"
          >
            <ImageIcon className="h-6 w-6" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handlePhotoSelect}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          placeholder="Nome do item (ex: Sofa 3 lugares)"
          className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          aria-label="Nome do item"
        />
        <input
          type="text"
          value={item.measurement}
          onChange={(e) => onUpdate(index, { measurement: e.target.value })}
          placeholder="Medida (ex: 2.0m x 0.9m x 0.8m)"
          className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
          aria-label="Medida do item"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mt-1 shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
        aria-label="Remover item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ReferenceItemList({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: ReferenceItemListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Itens especificos</h4>
        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          <Plus className="h-4 w-4" />
          Adicionar item
        </button>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <ReferenceItemRow
              key={item.id}
              item={item}
              index={index}
              onUpdate={onUpdateItem}
              onRemove={onRemoveItem}
            />
          ))}
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-gray-400">
          Nenhum item adicionado. Adicione moveis ou objetos especificos que deseja no ambiente.
        </p>
      )}
    </div>
  );
}
