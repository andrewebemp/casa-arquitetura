import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DecorAI Brasil',
  description: 'Transforme ambientes com inteligencia artificial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
