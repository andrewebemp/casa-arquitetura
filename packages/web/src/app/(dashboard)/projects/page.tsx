'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, RefreshCw } from 'lucide-react';
import { useProjects, useDeleteProject, useDuplicateProject } from '@/hooks/use-projects';
import { useSubscription } from '@/hooks/use-subscription';
import { useToggleFavorite } from '@/hooks/use-favorites';
import { ProjectCard } from '@/components/molecules/ProjectCard';
import { SkeletonCard } from '@/components/molecules/SkeletonCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { FilterBar } from '@/components/molecules/FilterBar';
import { RenderQuotaBanner } from '@/components/molecules/RenderQuotaBanner';
import { DeleteConfirmModal } from '@/components/molecules/DeleteConfirmModal';
import type { ProjectListParams } from '@/services/project-service';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const params: ProjectListParams = {
    style: searchParams.get('style') ?? undefined,
    sort: (searchParams.get('sort') as 'recent' | 'oldest') ?? 'recent',
    favorites: searchParams.get('favorites') === 'true',
  };

  const { data, isLoading, isError, refetch } = useProjects(params);
  const { data: subscription } = useSubscription();
  const deleteMutation = useDeleteProject();
  const duplicateMutation = useDuplicateProject();
  const favoriteMutation = useToggleFavorite();

  function handleToggleFavorite(projectId: string, isFavorite: boolean) {
    favoriteMutation.mutate({ projectId, isFavorite });
  }

  function handleDuplicate(projectId: string) {
    duplicateMutation.mutate(projectId);
  }

  function handleDelete(projectId: string) {
    const project = data?.projects.find((p) => p.id === projectId);
    setDeleteTarget({ id: projectId, name: project?.name ?? 'Projeto' });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  }

  function handleShare(projectId: string) {
    const url = `${window.location.origin}/projects/${projectId}`;
    navigator.clipboard.writeText(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading text-gray-900">Meus Projetos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus projetos de staging virtual
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Projeto
        </Link>
      </div>

      {subscription && <RenderQuotaBanner subscription={subscription} />}

      <FilterBar />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-12 text-center">
          <p className="text-sm text-gray-600">
            Nao foi possivel carregar seus projetos. Tente novamente.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !isError && data?.projects.length === 0 && (
        <EmptyState />
      )}

      {!isLoading && !isError && data && data.projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onToggleFavorite={handleToggleFavorite}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        open={deleteTarget !== null}
        projectName={deleteTarget?.name ?? ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    }>
      <ProjectsContent />
    </Suspense>
  );
}
