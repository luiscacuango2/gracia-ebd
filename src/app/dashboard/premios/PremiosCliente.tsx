'use client'

import { useState } from 'react'
import { entregarPremio, deshacerEntrega } from './acciones'

type Premio = {
  id: string
  estrellas_al_ganar: number
  entregado: boolean
  fecha_ganado: string
  fecha_entregado: string | null
  ninos: { nombres: string, apellidos: string } | null
}

export default function PremiosCliente({ premios, maestroId }: { premios: Premio[], maestroId: string }) {
  const [filtro, setFiltro] = useState<'pendientes' | 'entregados' | 'todos'>('pendientes')
  const [cargando, setCargando] = useState<string | null>(null)
  // Estado para el modal de confirmación
  const [premioADeshacer, setPremioADeshacer] = useState<string | null>(null)

  const filtrados = premios.filter(p => {
    if (filtro === 'pendientes') return !p.entregado
    if (filtro === 'entregados') return p.entregado
    return true
  })

  const pendientesCount = premios.filter(p => !p.entregado).length
  const entregadosCount = premios.filter(p => p.entregado).length

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const handleEntregar = async (id: string) => {
    setCargando(id)
    await entregarPremio(id, maestroId)
    setCargando(null)
  }

  const handleDeshacer = async (id: string) => {
    setCargando(id)
    await deshacerEntrega(id)
    setCargando(null)
    setPremioADeshacer(null) // Cerramos el modal
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2">
          🎁 Premios Ganados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Los niños ganan un premio automáticamente al llegar a <strong>50 estrellas</strong>.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFiltro('pendientes')}
          className={`px-4 py-2 rounded-lg font-medium transition ${filtro === 'pendientes'
            ? 'bg-red-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
        >
          ⏳ Pendientes ({pendientesCount})
        </button>
        <button
          onClick={() => setFiltro('entregados')}
          className={`px-4 py-2 rounded-lg font-medium transition ${filtro === 'entregados'
            ? 'bg-green-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
        >
          ✅ Entregados ({entregadosCount})
        </button>
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded-lg font-medium transition ${filtro === 'todos'
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
        >
          📋 Todos ({premios.length})
        </button>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center text-gray-500 dark:text-gray-400">
          {filtro === 'pendientes'
            ? '¡No hay premios pendientes! Todos están entregados. 🎉'
            : filtro === 'entregados'
              ? 'Aún no se ha entregado ningún premio.'
              : 'No hay premios registrados aún.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(p => (
            <div
              key={p.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${p.entregado
                ? 'border-green-500'
                : 'border-yellow-500'
                }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">{p.entregado ? '✅' : '🎁'}</span>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">
                    {p.ninos?.nombres} {p.ninos?.apellidos}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.entregado
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                    {p.entregado ? 'ENTREGADO' : 'PENDIENTE'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  🏆 Ganó con <strong>{p.estrellas_al_ganar}</strong> estrellas
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  📅 Ganado: {formatearFecha(p.fecha_ganado)}
                  {p.fecha_entregado && ` · Entregado: ${formatearFecha(p.fecha_entregado)}`}
                </p>
              </div>

              {!p.entregado && (
                <button
                  onClick={() => handleEntregar(p.id)}
                  disabled={cargando === p.id}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
                >
                  {cargando === p.id ? '...' : '✅ Marcar entregado'}
                </button>
              )}

              {/* Botón de Deshacer los premios entregados */}
              {p.entregado && (
                <button
                  onClick={() => setPremioADeshacer(p.id)}
                  disabled={cargando === p.id}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition disabled:opacity-50 whitespace-nowrap dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                  title="Deshacer entrega"
                >
                  ↩️ Deshacer
                </button>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Modal de Confirmación para deshacer la entrega */}
      {premioADeshacer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="text-5xl mb-4">↩️</div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">¿Deshacer entrega?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              El premio volverá a la lista de "Pendientes" y se borrará la fecha de entrega. Las estrellas del niño no se modificarán.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setPremioADeshacer(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeshacer(premioADeshacer)}
                disabled={cargando === premioADeshacer}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition disabled:opacity-50"
              >
                {cargando === premioADeshacer ? 'Procesando...' : 'Sí, deshacer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}