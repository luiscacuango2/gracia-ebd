'use client'
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // 🆕 Importamos esto
import { createClient } from '@/lib/supabase/client';

export default function BuscadorCodigo() {
  const searchParams = useSearchParams(); // 🆕 Leemos la URL
  const codigoUrl = searchParams.get('codigo'); // 🆕 Sacamos el código si viene en el QR

  const [codigo, setCodigo] = useState(codigoUrl || ''); // Inicializamos con el de la URL
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const supabase = createClient();

  // Función de búsqueda
  async function buscar(codigoBuscar: string) {
    if (!codigoBuscar) return;
    
    setLoading(true);
    setError(false);
    setResultado(null);

    const { data, error } = await supabase.rpc('buscar_nino_por_codigo', { 
      codigo: codigoBuscar.trim() 
    });

    if (error || !data || data.length === 0) {
      setError(true);
    } else {
      setResultado(data[0]);
    }
    setLoading(false);
  }

  // 🆕 EFECTO: Si viene código en la URL (por el QR), busca solito
  useEffect(() => {
    if (codigoUrl) {
      buscar(codigoUrl);
    }
  }, [codigoUrl]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    buscar(codigo);
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ingresa tu código secreto..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none text-center md:text-left text-lg font-bold"
        />
        <button 
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Ver mis estrellas'}
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-center mt-4 font-medium">
          Código no encontrado. Pregunta a tu maestro.
        </p>
      )}

      {resultado && (
        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 text-center animate-in fade-in zoom-in duration-300">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            ¡Hola, {resultado.nombres}!
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Asistencia</p>
              <p className="text-2xl font-black text-blue-500">{resultado.total_asistencia}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Comportamiento</p>
              <p className="text-2xl font-black text-yellow-500">{resultado.total_comportamiento}</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Versículos</p>
              <p className="text-2xl font-black text-green-500">{resultado.total_versiculo}</p>
            </div>
          </div>
          <p className="mt-4 text-lg font-bold text-gray-700">
            Total: <span className="text-red-600 text-2xl">{Number(resultado.total_asistencia) + Number(resultado.total_comportamiento) + Number(resultado.total_versiculo)}</span> ⭐
          </p>
        </div>
      )}
    </div>
  );
}