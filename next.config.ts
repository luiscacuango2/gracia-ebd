import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development', // Solo activar en producción
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline', // Página que se muestra si no hay conexión
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
