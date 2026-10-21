import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Боевой счётчик СПК',
    short_name: 'Счётчик',
    description: 'Считаем победы над Теплогазом',
    start_url: '/',
    display: 'standalone', // Это скрывает адресную строку браузера
    background_color: '#0a0510', // Наш черный фон
    theme_color: '#ff2d95',      // Наш розовый неон
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}