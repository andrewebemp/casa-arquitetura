'use client';

import { Camera, Ruler, Combine } from 'lucide-react';
import type { InputType } from '@decorai/shared';

interface InputTypeSelectorProps {
  selected: InputType | null;
  onSelect: (type: InputType) => void;
}

const INPUT_OPTIONS: { type: InputType; label: string; description: string; icon: typeof Camera }[] = [
  {
    type: 'photo',
    label: 'Foto do Local',
    description: 'Envie uma foto do ambiente para gerar o staging',
    icon: Camera,
  },
  {
    type: 'text',
    label: 'Descricao com Medidas',
    description: 'Descreva o espaco com dimensoes e aberturas',
    icon: Ruler,
  },
  {
    type: 'combined',
    label: 'Combinado',
    description: 'Envie foto e adicione descricao com medidas',
    icon: Combine,
  },
];

export function InputTypeSelector({ selected, onSelect }: InputTypeSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {INPUT_OPTIONS.map(({ type, label, description, icon: Icon }) => {
        const isSelected = selected === type;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 text-center transition-all ${
              isSelected
                ? 'border-brand-600 bg-brand-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            aria-pressed={isSelected}
          >
            <div
              className={`rounded-lg p-3 ${
                isSelected ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <h3 className={`font-semibold ${isSelected ? 'text-brand-700' : 'text-gray-900'}`}>
                {label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
