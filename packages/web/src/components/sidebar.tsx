'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  PlusCircle,
  User,
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Meus Projetos', icon: FolderOpen },
  { href: '/projects/new', label: 'Novo Projeto', icon: PlusCircle },
  { href: '/profile', label: 'Meu Perfil', icon: User },
  { href: '/subscription', label: 'Assinatura', icon: CreditCard },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-sidebar transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:z-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="text-xl font-bold text-brand-700">
            DecorAI
          </Link>
        </div>

        <nav className="mt-4 space-y-1 px-3" aria-label="Menu principal">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
