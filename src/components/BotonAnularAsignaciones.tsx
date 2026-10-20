'use client'

import { useState } from 'react'
import { anularAsignaciones } from '@/app/dashboard/semanas/acciones-anular'
import { useRouter } from 'next/navigation'

export default function BotonAnularAsignaciones() {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [quitarPrincipal, setQuitarPrincipal] = useState(false)
  const [quitarAyudante, setQuitarAyudante] = useState(false)
  const [quitarNinos, setQuitarNinos] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [resultado, setResultado] = useState<any>(null)

  const todosMarcados = quitarPrincipal && quitarAyudante && quitarNinos

  const toggleTodos = () => {
    const nuevoValor = !todosMarcados
    setQuitarPrincipal(nuevoValor)
    setQuitarAyudante(nuevoValor)
    setQuitarNinos(nuevoValor)
  }

  const handleAbrir = () => {
    setAbierto(true)
    setMensaje('')
    setResultado(null)
    const hoy = new Date().toISOString().split('T')[0]
    const futuro = new Date()
    futuro.setMonth(futuro.getMonth() + 3)
    const fechaFuturo = futuro.toISOString().split('T')[0]
    setFechaDesde(hoy)
    setFechaHasta(fechaFuturo)
  }

  const handleAnular = async () => {
    if (!fechaDesde || !fechaHasta) {
      setMensaje('⚠️ Debes indicar las fechas')
      return
    }

    if (fechaDesde > fechaHasta) {
      setMensaje('⚠️ La fecha "desde" no puede ser mayor que "hasta"')
      return
    }

    if (!quitarPrincipal && !quitarAyudante && !quitarNinos) {
      setMensaje('⚠️ Selecciona al menos un rol para quitar')
      return
    }

    const confirmacion = confirm(
      '⚠️ ¿Estás seguro de anular las asignaciones?\n\nEsta acción no se puede deshacer y quedará registrada en el historial.'
    )
    if (!confirmacion) return

    setCargando(true)
    setMensaje('')
    setResultado(null)

    const res = await anularAsignaciones({
      fechaDesde,
      fechaHasta,
      quitarPrincipal,
      quitarAyudante,
      quitarNinos,
    })

    setResultado(res)
    setCargando(false)

    if (res.exito) {
      router.refresh()
    }
  }

  const cerrar = () => {
    setAbierto(false)
    setMensaje('')
    setResultado(null)
    setQuitarPrincipal(false)
    setQuitarAyudante(false)
    setQuitarNinos(false)
  }

  return (
    <>
      <button
        onClick={handleAbrir}
        className="px-3 py-1.5 rounded-lg border border-orange-600 dark:border-orange-500 text-orange-600 dark:text-orange-400 font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs whitespace-nowrap inline-flex items-center"
      >
        <span className="hidden sm:inline">🗑️ Anular asignaciones</span>
        <span className="sm:hidden">🗑️ Anular</span>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={cerrar}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                🗑️ Anular asignaciones
              </h2>
              <button
                onClick={cerrar}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {!resultado ? (
                <>
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-3">
                    <p className="text-xs text-orange-800 dark:text-orange-300">
                      ⚠️ Esta acción quitará las asignaciones de los maestros
                      en las semanas dentro del rango de fechas. Se registrará
                      en el historial de rotaciones.
                    </p>
                  </div>

                  {/* Rango de fechas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      📅 Rango de fechas
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Desde</label>
                        <input
                          type="date"
                          value={fechaDesde}
                          onChange={(e) => setFechaDesde(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Hasta</label>
                        <input
                          type="date"
                          value={fechaHasta}
                          onChange={(e) => setFechaHasta(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selector de roles */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        🎯 ¿Qué quieres quitar?
                      </label>
                      <button
                        type="button"
                        onClick={toggleTodos}
                        className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-medium"
                      >
                        {todosMarcados ? 'Desmarcar todos' : 'Marcar todos'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={quitarPrincipal}
                          onChange={(e) => setQuitarPrincipal(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          🧑‍🏫 Maestro principal
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={quitarAyudante}
                          onChange={(e) => setQuitarAyudante(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          🤝 Maestro ayudante
                        </span>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="checkbox"
                          checked={quitarNinos}
                          onChange={(e) => setQuitarNinos(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          🧒 Maestro de niños
                        </span>
                      </label>
                    </div>
                  </div>

                  {mensaje && (
                    <p className="text-sm text-center text-orange-600 dark:text-orange-400 font-medium">
                      {mensaje}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={handleAnular}
                      disabled={
                        cargando ||
                        !fechaDesde ||
                        !fechaHasta ||
                        (!quitarPrincipal && !quitarAyudante && !quitarNinos)
                      }
                      className="flex-1 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#EA580C' }}
                    >
                      {cargando ? 'Anulando...' : '🗑️ Anular asignaciones'}
                    </button>
                    <button
                      onClick={cerrar}
                      disabled={cargando}
                      className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`rounded-lg p-4 border ${
                      resultado.exito
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        resultado.exito
                          ? 'text-green-800 dark:text-green-300'
                          : 'text-red-800 dark:text-red-300'
                      }`}
                    >
                      {resultado.exito ? '✅ ' : '❌ '}
                      {resultado.mensaje}
                    </p>
                  </div>

                  <button
                    onClick={cerrar}
                    className="w-full px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: '#E31E24' }}
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}