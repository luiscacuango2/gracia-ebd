import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: true, // 🆕 DESACTIVADO TEMPORALMENTE
  register: false, // 🆕 No registrar el SW
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  // runtimeCaching va DENTRO de workboxOptions
  workboxOptions: {
    // Evitar que la PWA guarde en caché las respuestas de Supabase
    runtimeCaching: [
      {
        // Evitar que las peticiones a la API de Supabase se guarden en caché
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkOnly',
        options: {
          cacheName: 'supabase-api',
        },
      },
      {
        // Cachear las imágenes públicas de Supabase Storage
        urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'supabase-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 días
          },
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  // Silenciar el aviso de Turbopack (la PWA sigue usando Webpack para el build)
  turbopack: {},
  // Desactivar el indicador de desarrollo (botón "N" flotante)
  devIndicators: false,

  // Permitir acceso desde IPs locales (celular, tablet, etc.)
  allowedDevOrigins: [
    '192.168.1.18',
    '192.168.1.23',
    '192.168.1.*',
    '192.168.*.*',
    '10.*.*.*',
    '172.16.*.*',
  ],
};

export default withPWA(nextConfig)
