import Link from 'next/link';

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Public header — logo only, no auth */}
      <header className="flex h-14 items-center border-b bg-white px-4 md:px-6">
        <Link href="/" className="text-lg font-bold text-brand-600">
          DecorAI Brasil
        </Link>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer with disclaimer */}
      <footer className="border-t bg-white px-4 py-4 text-center text-xs text-gray-500">
        <p>Imagem ilustrativa gerada por IA</p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} DecorAI Brasil. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
