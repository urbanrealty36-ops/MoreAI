import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'More AI - Playful Neo-Brutalist PWA',
    short_name: 'MoreAI',
    description: 'AI Workspace, Agent Platform & Network Partnership Ecosystem',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F7F4EC',
    theme_color: '#C9F2D5',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
