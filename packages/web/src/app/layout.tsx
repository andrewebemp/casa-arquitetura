import type { Metadata } from 'next';
import { DisclaimerFooter } from '@/components/disclaimer-footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'DecorAI Brasil',
    template: '%s | DecorAI Brasil',
  },
  description: 'Transforme ambientes com inteligencia artificial. Plataforma de decoracao virtual com IA.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <div className="flex-1">{children}</div>
          <DisclaimerFooter />
        </div>
      </body>
    </html>
  );
}
