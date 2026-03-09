import { FolderOpen, PlusCircle, Palette, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    href: '/projects/new',
    label: 'Novo Projeto',
    description: 'Crie um novo projeto de decoracao',
    icon: PlusCircle,
    color: 'bg-brand-50 text-brand-600',
  },
  {
    href: '/projects',
    label: 'Meus Projetos',
    description: 'Veja seus projetos recentes',
    icon: FolderOpen,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    href: '/projects/new',
    label: 'Gerar Render',
    description: 'Transforme um ambiente com IA',
    icon: Palette,
    color: 'bg-green-50 text-green-600',
  },
  {
    href: '/subscription',
    label: 'Minha Assinatura',
    description: 'Gerencie seu plano e creditos',
    icon: BarChart3,
    color: 'bg-orange-50 text-orange-600',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-heading text-gray-900">Bem-vindo ao DecorAI</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comece transformando seus ambientes com inteligencia artificial.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`inline-flex rounded-lg p-2 ${action.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900">{action.label}</h3>
              <p className="mt-1 text-sm text-gray-500">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
