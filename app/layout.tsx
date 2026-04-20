import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Space_Grotesk } from 'next/font/google';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'OpsBoard | SLA, incidentes e status page em um único fluxo',
  description: 'Plataforma B2B para monitoramento de SLA, incidentes e status page pública com multi-tenant e Google Auth.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${spaceGrotesk.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
