import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import BuscadorCodigo from './BuscadorCodigo';
import BotonInstalarPWA from '@/components/BotonInstalarPWA'; // 🆕

export const revalidate = 0;

export default async function PuntosPublicosPage() {
  return (
    <div className="min-h-screen bg-[#e0f2f1] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8 pt-12">
        
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-red-600 tracking-wider">
            ¡MIS ESTRELLAS!
          </h1>
          <p className="text-gray-600 mt-2 font-medium">
            Consulta tus puntos de la Escuela Bíblica Dominical
          </p>
        </header>

        <Suspense fallback={<div className="text-center text-gray-500 mt-4">Cargando buscador...</div>}>
          <BuscadorCodigo />
        </Suspense>

        {/* 🆕 Botón de instalar PWA */}
        <BotonInstalarPWA />
      </div>
    </div>
  );
}