'use client'

import { useState } from 'react'
import { obtenerHistorialNino } from './acciones'

type NinoRanking = {
  id: string
  nombres: string
  apellidos: string
  total_asistencia: number
  total_comportamiento: number
  total_versiculo: number
  total_estrellas: number
}

export default function CarteleraCliente({ rankingInicial }: { rankingInicial: NinoRanking[] }) {
  const [busqueda, setBusqueda] = useState('')

  // 🆕 Estados para el modal del historial
  const [modalAbierto, setModalAbierto] = useState(false)
  const [ninoSeleccionado, setNinoSeleccionado] = useState<NinoRanking | null>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)

  const filtrados = rankingInicial.filter(n =>
    `${n.nombres} ${n.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getMedalla = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return null
  }

  const calcularPorcentaje = (total: number) => {
    return Math.min((total / 50) * 100, 100)
  }

  // 🆕 Función para abrir el modal y buscar los datos
  const abrirHistorial = async (nino: NinoRanking) => {
    setNinoSeleccionado(nino)
    setModalAbierto(true)
    setCargandoHistorial(true)
    setHistorial([])

    const res = await obtenerHistorialNino(nino.id)
    if (res.exito) {
      setHistorial(res.datos)
    } else {
      // Si hay error, podríamos mostrar un mensaje, pero por ahora dejamos el arreglo vacío
      console.error(res.mensaje)
    }
    setCargandoHistorial(false)
  }

  const cerrarModal = () => {
    setModalAbierto(false)
    setNinoSeleccionado(null)
    setHistorial([])
  }

  // Formatear fecha de SQL a texto bonito
  const formatearFecha = (fechaStr: string) => {
    if (!fechaStr) return '-'
    const fecha = new Date(fechaStr + 'T12:00:00')
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 tracking-wide mb-2">
          🏆 Cartelera de Puntos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vista general de todos los niños registrados (Maestros y Administradores)
        </p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar niño por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.length === 0 ? (
          <div className="col-span-full text-center p-8 text-gray-500">
            No se encontraron niños con ese nombre.
          </div>
        ) : (
          filtrados.map((nino, index) => (
            <div
              key={nino.id}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg overflow-hidden border transition-all duration-200 flex flex-col ${index === 0 ? 'border-yellow-400' :
                index === 1 ? 'border-gray-300' :
                  index === 2 ? 'border-orange-300' :
                    'border-gray-200 dark:border-gray-700'
                }`}
            >
              <div style={{ backgroundColor: '#B91C1C' }} className="text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2 truncate">
                  {getMedalla(index) && <span className="text-xl drop-shadow-md">{getMedalla(index)}</span>}
                  <h3 className="font-bold truncate">
                    {nino.nombres} {nino.apellidos}
                  </h3>
                </div>
                <div className="bg-black/20 text-white rounded-full px-3 py-1 text-sm font-black shrink-0 ml-2 shadow-inner">
                  {nino.total_estrellas} ⭐
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">✅ Asistencia</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{nino.total_asistencia}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calcularPorcentaje(nino.total_asistencia)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">🤝 Comportamiento</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{nino.total_comportamiento}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calcularPorcentaje(nino.total_comportamiento)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">📖 Versículo</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{nino.total_versiculo}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${calcularPorcentaje(nino.total_versiculo)}%` }}></div>
                  </div>
                </div>
              </div>

              {/* 🆕 Botón de Historial al pie de la tarjeta */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                <button
                  onClick={() => abrirHistorial(nino)}
                  className="w-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                >
                  📋 Ver historial completo
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {filtrados.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-8">
          Mostrando {filtrados.length} {filtrados.length === 1 ? 'niño' : 'niños'}. Las barras se llenan al llegar a 50 estrellas.
        </p>
      )}

      {/* 🆕 Modal de Historial */}
      {modalAbierto && ninoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={cerrarModal}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            {/* Encabezado del Modal */}
            <div style={{ backgroundColor: '#B91C1C' }} className="text-white p-4 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="font-bold text-lg">Historial de {ninoSeleccionado.nombres} {ninoSeleccionado.apellidos}</h3>
                <p className="text-red-100 text-sm">Total de estrellas: {ninoSeleccionado.total_estrellas} ⭐</p>
              </div>
              <button onClick={cerrarModal} className="text-white/80 hover:text-white bg-black/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-4 overflow-y-auto flex-1">
              {cargandoHistorial ? (
                <div className="text-center py-8 text-gray-500 animate-pulse">Cargando registros...</div>
              ) : historial.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Este niño aún no tiene registros de puntos.</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold rounded-tl-lg">Fecha</th>
                      <th className="p-3 font-semibold text-center">Asist.</th>
                      <th className="p-3 font-semibold text-center">Comp.</th>
                      <th className="p-3 font-semibold text-center">Vers.</th>
                      <th className="p-3 font-semibold rounded-tr-lg">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial
                      .filter(r => r.asistencia || r.comportamiento || r.versiculo) // 🆕 Filtro extra de seguridad
                      .map((registro) => (
                        <tr key={registro.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                            {formatearFecha(registro.semanas?.fecha)}
                          </td>
                          <td className="p-3 text-center">
                            {registro.asistencia ? '⭐' : <span className="text-gray-300 dark:text-gray-600">-</span>}
                          </td>
                          <td className="p-3 text-center">
                            {registro.comportamiento ? '⭐' : <span className="text-gray-300 dark:text-gray-600">-</span>}
                          </td>
                          <td className="p-3 text-center">
                            {registro.versiculo ? '⭐' : <span className="text-gray-300 dark:text-gray-600">-</span>}
                          </td>
                          <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {registro.maestros?.nombres || 'Sistema'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}