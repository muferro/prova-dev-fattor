import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fattor Crédito | Validador CNAB 444 & Consulta NF-e (BFF)',
  description:
    'Sistema de processamento de remessa bancária CNAB 444 e validação de lastro fiscal via consulta de status de NF-e na API Fattor utilizando arquitetura BFF.',
  icons: {
    icon: '/logo-fattor.png',
    apple: '/logo-fattor.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased font-sans transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
