import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OpsBoard',
  description: 'SLA, incidentes e status page em uma única plataforma.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
