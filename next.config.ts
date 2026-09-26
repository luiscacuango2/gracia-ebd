import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactivar el indicador de desarrollo (botón "N" flotante)
  devIndicators: false,

  // Permitir acceso desde IPs locales (celular, tablet, etc.)
  allowedDevOrigins: [
    '192.168.1.18',
    '192.168.1.*',
    '192.168.*.*',
    '10.*.*.*',
    '172.16.*.*',
  ],
};

export default nextConfig;
