'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { OpeningInput } from '@/hooks/use-new-project-wizard';

const ROOM_TYPES = [
  { value: '', label: 'Selecione o tipo de ambiente' },
  { value: 'sala', label: 'Sala' },
  { value: 'quarto', label: 'Quarto' },
  { value: 'cozinha', label: 'Cozinha' },
  { value: 'banheiro', label: 'Banheiro' },
  { value: 'escritorio', label: 'Escritorio' },
  { value: 'varanda', label: 'Varanda' },
  { value: 'outro', label: 'Outro' },
];

const OPENING_TYPES = [
  { value: 'door', label: 'Porta' },
  { value: 'window', label: 'Janela' },
  { value: 'archway', label: 'Arco' },
];

const WALL_OPTIONS = [
  { value: 'north', label: 'Norte' },
  { value: 'south', label: 'Sul' },
  { value: 'east', label: 'Leste' },
  { value: 'west', label: 'Oeste' },
];

interface SpatialFormProps {
  roomType: string;
  width: string;
  length: string;
  ceilingHeight: string;
  openings: OpeningInput[];
  additionalDescription: string;
  onRoomTypeChange: (value: string) => void;
  onDimensionChange: (field: 'width' | 'length' | 'ceilingHeight', value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddOpening: () => void;
  onUpdateOpening: (index: number, opening: OpeningInput) => void;
  onRemoveOpening: (index: number) => void;
}

export function SpatialForm({
  roomType,
  width,
  length,
  ceilingHeight,
  openings,
  additionalDescription,
  onRoomTypeChange,
  onDimensionChange,
  onDescriptionChange,
  onAddOpening,
  onUpdateOpening,
  onRemoveOpening,
}: SpatialFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="room-type" className="block text-sm font-medium text-gray-700">
          Tipo de ambiente
        </label>
        <select
          id="room-type"
          value={roomType}
          onChange={(e) => onRoomTypeChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {ROOM_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700">
            Largura (m) *
          </label>
          <input
            id="width"
            type="number"
            step="0.1"
            min="0"
            value={width}
            onChange={(e) => onDimensionChange('width', e.target.value)}
            placeholder="Ex: 4.5"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            required
          />
        </div>
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700">
            Comprimento (m) *
          </label>
          <input
            id="length"
            type="number"
            step="0.1"
            min="0"
            value={length}
            onChange={(e) => onDimensionChange('length', e.target.value)}
            placeholder="Ex: 6.0"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            required
          />
        </div>
        <div>
          <label htmlFor="ceiling" className="block text-sm font-medium text-gray-700">
            Pe-direito (m)
          </label>
          <input
            id="ceiling"
            type="number"
            step="0.1"
            min="0"
            value={ceilingHeight}
            onChange={(e) => onDimensionChange('ceilingHeight', e.target.value)}
            placeholder="Ex: 2.7"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Aberturas</h4>
          <button
            type="button"
            onClick={onAddOpening}
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        {openings.length > 0 && (
          <div className="mt-3 space-y-3">
            {openings.map((opening, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <select
                  value={opening.type}
                  onChange={(e) =>
                    onUpdateOpening(index, { ...opening, type: e.target.value as OpeningInput['type'] })
                  }
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  aria-label="Tipo de abertura"
                >
                  {OPENING_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={opening.wall}
                  onChange={(e) =>
                    onUpdateOpening(index, { ...opening, wall: e.target.value as OpeningInput['wall'] })
                  }
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  aria-label="Parede"
                >
                  {WALL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={opening.width}
                  onChange={(e) =>
                    onUpdateOpening(index, { ...opening, width: e.target.value })
                  }
                  placeholder="Larg. (m)"
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  aria-label="Largura da abertura"
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={opening.height}
                  onChange={(e) =>
                    onUpdateOpening(index, { ...opening, height: e.target.value })
                  }
                  placeholder="Alt. (m)"
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
                  aria-label="Altura da abertura"
                />
                <button
                  type="button"
                  onClick={() => onRemoveOpening(index)}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remover abertura"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descricao adicional
        </label>
        <textarea
          id="description"
          value={additionalDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descreva detalhes adicionais do ambiente (ex: piso de madeira, parede com textura, iluminacao natural)..."
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
    </div>
  );
}
