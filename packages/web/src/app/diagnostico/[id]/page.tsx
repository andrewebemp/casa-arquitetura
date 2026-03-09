import type { Metadata } from 'next';
import type { DiagnosticResponse } from '@decorai/shared';
import Link from 'next/link';
import { DiagnosticResultView } from './diagnostic-result-view';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

async function fetchDiagnosticData(
  id: string
): Promise<{ data: DiagnosticResponse | null; status: number }> {
  try {
    const response = await fetch(`${API_BASE}/api/diagnostics/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { data: null, status: response.status };
    }

    const json = await response.json();
    return { data: json.data ?? json, status: 200 };
  } catch {
    return { data: null, status: 500 };
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { data } = await fetchDiagnosticData(id);

  if (!data) {
    return {
      title: 'Diagnostico — DecorAI Brasil',
      description: 'Analise gratuita de staging para seu imovel',
    };
  }

  const title = `Score ${data.analysis.overall_score}/100 — Diagnostico DecorAI`;
  const description = `Este imovel pode estar perdendo ate ${data.analysis.estimated_loss_percent}% do valor potencial. Analise gratuita por IA.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const shareUrl = `${siteUrl}/diagnostico/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'DecorAI Brasil',
      images: data.staged_preview_url
        ? [
            {
              url: data.staged_preview_url,
              width: 1200,
              height: 630,
              alt: `Diagnostico de staging — Score ${data.analysis.overall_score}`,
            },
          ]
        : data.original_image_url
          ? [
              {
                url: data.original_image_url,
                width: 1200,
                height: 630,
                alt: 'Foto do imovel analisado',
              },
            ]
          : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: data.staged_preview_url
        ? [data.staged_preview_url]
        : data.original_image_url
          ? [data.original_image_url]
          : [],
    },
  };
}

export default async function DiagnosticoResultPage({ params }: PageProps) {
  const { id } = await params;
  const { data, status } = await fetchDiagnosticData(id);

  if (!data || status === 404) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Diagnostico nao encontrado</h1>
          <p className="mt-3 text-gray-600">
            O diagnostico que voce acessou nao existe ou foi removido.
          </p>
          <Link
            href="/diagnostico"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Fazer Novo Diagnostico
          </Link>
        </div>
      </div>
    );
  }

  if (status >= 500) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Erro ao carregar</h1>
          <p className="mt-3 text-gray-600">
            Nao foi possivel carregar o resultado. Tente novamente mais tarde.
          </p>
          <Link
            href="/diagnostico"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Fazer Novo Diagnostico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <DiagnosticResultView data={data} />
    </div>
  );
}
