import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  ctaLabel?: string;
  ctaHref?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'Nenhum projeto ainda',
  message = 'Crie seu primeiro projeto de staging',
  ctaLabel = '+ Novo Projeto',
  ctaHref = '/projects/new',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white py-16 px-6 text-center">
      <div className="mb-4 rounded-full bg-brand-50 p-4 text-brand-600">
        {icon ?? <FolderOpen className="h-10 w-10" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
