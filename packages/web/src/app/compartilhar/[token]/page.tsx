import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicSlider } from './public-slider';
import { AiDisclaimer } from '@/components/atoms/AiDisclaimer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

interface ShareData {
  original_url: string;
  rendered_url: string;
  project_name: string;
  style: string;
  created_at: string;
  include_watermark: boolean;
}

async function fetchShareData(token: string): Promise<{ data: ShareData | null; status: number }> {
  try {
    const response = await fetch(`${API_BASE}/api/share/${token}`, {
      cache: 'no-store',
    });

    if (response.status === 410) {
      return { data: null, status: 410 };
    }

    if (response.status === 404) {
      return { data: null, status: 404 };
    }

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
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const { data } = await fetchShareData(token);

  if (!data) {
    return {
      title: 'Compartilhamento — DecorAI Brasil',
      description: 'Veja a transformacao do ambiente com staging virtual',
    };
  }

  const title = `${data.project_name} — DecorAI Brasil`;
  const description = 'Veja a transformacao do ambiente com staging virtual';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const shareUrl = `${siteUrl}/compartilhar/${token}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: shareUrl,
      siteName: 'DecorAI Brasil',
      images: [
        {
          url: data.rendered_url,
          width: 1200,
          height: 630,
          alt: `Staging virtual — ${data.project_name}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [data.rendered_url],
    },
  };
}

export default async function PublicSharePage({ params }: PageProps) {
  const { token } = await params;
  const { data, status } = await fetchShareData(token);

  // Expired link
  if (status === 410) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Link expirado</h1>
          <p className="mt-3 text-gray-600">
            Este link expirou. Solicite um novo link ao proprietario do projeto.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Ir para o inicio
          </Link>
        </div>
      </div>
    );
  }

  // Invalid / not found
  if (!data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">Link nao encontrado</h1>
          <p className="mt-3 text-gray-600">
            O link que voce acessou nao existe ou foi removido.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
          >
            Ir para o inicio
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(data.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:py-10">
      {/* Slider */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <PublicSlider
          beforeUrl={data.original_url}
          afterUrl={data.rendered_url}
        />
      </div>

      {/* Project info */}
      <div className="mt-4 text-center">
        <h1 className="text-xl font-bold text-gray-900">{data.project_name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Estilo: <span className="font-medium text-gray-700">{data.style}</span>
          {' · '}
          {formattedDate}
        </p>
      </div>

      {/* Disclaimer */}
      <AiDisclaimer className="mt-3 text-center" />

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-block rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-700"
        >
          Transforme seu imovel tambem — Comece Gratis
        </Link>
      </div>
    </div>
  );
}
