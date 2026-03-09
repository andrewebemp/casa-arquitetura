'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite } from '@/services/project-service';
import type { Project } from '@decorai/shared';
import type { ProjectListResponse } from '@/services/project-service';

interface ToggleFavoriteParams {
  projectId: string;
  isFavorite: boolean;
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, isFavorite }: ToggleFavoriteParams) =>
      toggleFavorite(projectId, isFavorite),
    onMutate: async ({ projectId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      const previousQueries = queryClient.getQueriesData<ProjectListResponse>({
        queryKey: ['projects'],
      });

      queryClient.setQueriesData<ProjectListResponse>(
        { queryKey: ['projects'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            projects: old.projects.map((p: Project) =>
              p.id === projectId ? { ...p, is_favorite: isFavorite } : p
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
