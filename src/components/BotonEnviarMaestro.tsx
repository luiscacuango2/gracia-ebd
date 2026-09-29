'use client'

import { useState } from 'react'
import { obtenerOCrearToken, regenerarToken } from '@/app/dashboard/semanas/acciones-token'

export default function BotonEnviarMaestro({
  semanaId,
  semanaTema,
  semanaFecha,
  tokenActual,
  esAdmin,
  tienePrincipal,
  tieneNinos,
}: {
  semanaId: string
  semanaTema: string
  semanaFecha: string
  tokenActual: string | null
  esAdmin: boolean
  tienePrincipal: boolean
  tieneNinos: boolean
}) {
  const [abierto, setAbierto] = useState(false)
  const [token, setToken] = useState<string | null>(tokenActual)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const enlacePrincipal = token ? `${baseUrl}/editar/${token}` : ''
  const enlaceNinos = token ? `${baseUrl}/actividad/${token}` : ''

  const handleAbrir = async () => {
    setAbierto(true)
    setMensaje('')

    if (!token) {
      setCargando(true)
      const res = await obtenerOCrearToken(semanaId)
      if (res.exito && res.token) {
        setToken(res.token)
      } else {
        setMensaje('❌ ' + res.mensaje)
      }
      setCargando(false)
    }
  }

  const handleCopiar = async (enlace: string, tipo: string) => {
    try {
      await navigator.clipboard.writeText(enlace)
      setCopiado(tipo)
      setTimeout(() => setCopiado(null), 2000)
    } catch {
      setMensaje('❌ No se pudo copiar')
    }
  }

  const handleCompartirWhatsApp = (enlace: string, tipo: 'principal' | 'ninos') => {
    const texto =
      tipo === 'principal'
        ? `Hola, te comparto el enlace para editar tu clase como maestro principal:\n\n*Tema:* ${semanaTema}\n\n${enlace}\n\nPuedes modificar el tema, versículos, manualidad y la actividad de niños. La fecha queda bloqueada.\n\nDios te bendice.`
        : `Hola, te comparto el enlace para registrar la actividad de niños pequeños:\n\n*Tema:* ${semanaTema}\n\n${enlace}\n\nAquí puedes escribir la actividad que realizarás con los niños.\n\nDios te bendice.`
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  const handleRegenerar = async () => {
    if (!confirm('¿Regenerar el enlace? Los enlaces anteriores dejarán de funcionar.')) return
    setCargando(true)
    const res = await regenerarToken(semanaId)
    if (res.exito && res.token) {
      setToken(res.token)
      setMensaje('✅ Enlaces regenerados correctamente')
    } else {
      setMensaje('❌ ' + res.mensaje)
    }
    setCargando(false)
  }

  const cerrar = () => {
    setAbierto(false)
    setMensaje('')
    setCopiado(null)
  }

  const fechaFormateada = new Date(
    semanaFecha + 'T12:00:00'
  ).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <button
        onClick={handleAbrir}
        className="inline-block px-4 py-2 rounded-lg border border-blue-600 text-blue-600 text-sm font-medium hover:bg-blue-50"
      >
        📤 Enviar enlaces a maestros
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={cerrar}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera mejorada */}
            <div className="p-4 border-b flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-1">
                  📤 Enviar enlaces a maestros
                </h2>
                <p className="text-sm sm:text-base text-gray-600 capitalize font-medium">
                  {fechaFormateada}
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-800 mt-0.5 truncate">
                  {semanaTema}
                </p>
              </div>
              <button
                onClick={cerrar}
                className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {cargando && !token ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">Generando enlaces...</p>
                </div>
              ) : token ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      ℹ️ Cada maestro tiene su propio enlace. No requiere iniciar
                      sesión y solo puede editar lo que le corresponde.
                    </p>
                  </div>

                  {/* Enlace para Maestro Principal */}
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🧑‍🏫</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          Enlace para Maestro Principal
                        </p>
                        <p className="text-xs text-gray-600">
                          Puede editar tema, versículos, manualidad y actividad
                          de niños.
                        </p>
                      </div>
                      {!tienePrincipal && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Sin asignar
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={enlacePrincipal}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs font-mono"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            handleCopiar(enlacePrincipal, 'principal')
                          }
                          className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap ${
                            copiado === 'principal'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-white hover:bg-gray-700'
                          }`}
                        >
                          {copiado === 'principal' ? '✅' : '📋 Copiar'}
                        </button>
                        <button
                          onClick={() =>
                            handleCompartirWhatsApp(enlacePrincipal, 'principal')
                          }
                          className="px-3 py-2 rounded-lg text-white text-xs font-medium"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          📱
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Enlace para Maestro de Niños */}
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🧒</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          Enlace para Maestro de Niños
                        </p>
                        <p className="text-xs text-gray-600">
                          Solo puede registrar la <strong>actividad para niños pequeños</strong>.
                        </p>
                      </div>
                      {!tieneNinos && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          Sin asignar
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={enlaceNinos}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-xs font-mono"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleCopiar(enlaceNinos, 'ninos')}
                          className={`px-3 py-2 rounded-lg font-medium text-xs whitespace-nowrap ${
                            copiado === 'ninos'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-800 text-white hover:bg-gray-700'
                          }`}
                        >
                          {copiado === 'ninos' ? '✅' : '📋 Copiar'}
                        </button>
                        <button
                          onClick={() =>
                            handleCompartirWhatsApp(enlaceNinos, 'ninos')
                          }
                          className="px-3 py-2 rounded-lg text-white text-xs font-medium"
                          style={{ backgroundColor: '#25D366' }}
                        >
                          📱
                        </button>
                      </div>
                    </div>
                  </div>

                  {esAdmin && (
                    <button
                      onClick={handleRegenerar}
                      disabled={cargando}
                      className="w-full px-4 py-2 rounded-lg border border-red-600 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
                    >
                      🔄 Regenerar enlaces (los anteriores dejarán de funcionar)
                    </button>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Advertencia:</strong> Cualquiera con estos
                      enlaces puede editar. Compártelos solo con los maestros
                      asignados.
                    </p>
                  </div>
                </>
              ) : null}

              {mensaje && (
                <p className="text-sm text-center text-gray-700">{mensaje}</p>
              )}

              <button
                onClick={cerrar}
                className="w-full px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
