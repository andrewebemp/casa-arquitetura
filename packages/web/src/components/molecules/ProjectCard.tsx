'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@decorai/shared';
import {
  Heart,
  MoreVertical,
  ExternalLink,
  Copy,
  Trash2,
  Share2,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onToggleFavorite: (projectId: string, isFavorite: boolean) => void;
  onDuplicate: (projectId: string) => void;
  onDelete: (projectId: string) => void;
  onShare: (projectId: string) => void;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: 'Rascunho', className: 'bg-gray-100 text-gray-700' },
  analyzing: { label: 'Analisando', className: 'bg-yellow-100 text-yellow-700' },
  croqui_review: { label: 'Revisao', className: 'bg-blue-100 text-blue-700' },
  generating: { label: 'Gerando', className: 'bg-purple-100 text-purple-700' },
  ready: { label: 'Pronto', className: 'bg-green-100 text-green-700' },
  error: { label: 'Erro', className: 'bg-red-100 text-red-700' },
};

export function ProjectCard({
  project,
  onToggleFavorite,
  onDuplicate,
  onDelete,
  onShare,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.draft;

  const formattedDate = new Date(project.updated_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="group relative rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-100">
          {project.original_image_url ? (
            <Image
              src={project.original_image_url}
              alt={project.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {project.name}
            </h3>
            <p className="mt-0.5 text-xs capitalize text-gray-500">
              {project.style}
            </p>
          </div>

          <button
            onClick={() => onToggleFavorite(project.id, !project.is_favorite)}
            className="ml-2 shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:text-red-500"
            aria-label={project.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart
              className={`h-4 w-4 ${project.is_favorite ? 'fill-red-500 text-red-500' : ''}`}
            />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">{formattedDate}</span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 group-hover:opacity-100"
              aria-label="Acoes do projeto"
              aria-expanded={menuOpen}
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  aria-hidden="true"
                />
                <div className="absolute bottom-full right-0 z-50 mb-1 w-40 rounded-lg border bg-white py-1 shadow-lg">
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </Link>
                  <button
                    onClick={() => {
                      onDuplicate(project.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </button>
                  <button
                    onClick={() => {
                      onShare(project.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartilhar
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onDelete(project.id);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
