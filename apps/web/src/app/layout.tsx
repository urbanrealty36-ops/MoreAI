import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

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
    <html lang="id" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body
        className="min-h-screen bg-[#F7F4EC] text-[#171717] antialiased selection:bg-[#C9F2D5] selection:text-[#171717]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
