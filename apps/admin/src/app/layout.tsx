import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#C9F2D5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'More AI - Playful Neo-Brutalist PWA',
  description:
    'MoreAI: Platform AI Workspace, Agent & Ekosistem Network Partnership berbasis PWA Mobile-First dengan gaya Playful Neo-Brutalism & Soft Pastel.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MoreAI',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'More AI - Playful Neo-Brutalist PWA',
    description:
      'Satu Platform AI untuk Berpikir, Berkarya, dan Bertindak. AI Workspace, Agent, serta Free AI Credit di Jaringan Mitra.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'More AI - Playful Neo-Brutalist PWA',
    description:
      'Platform AI Workspace & Network Partnership Ekosistem.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#F7F4EC] text-[#171717] antialiased selection:bg-[#C9F2D5] selection:text-[#171717]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
