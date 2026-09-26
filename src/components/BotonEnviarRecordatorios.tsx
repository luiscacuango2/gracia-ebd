'use client'

import { useState } from 'react'

export default function BotonEnviarRecordatorios({
  semanaId,
  semanaTema,
  semanaFecha,
  tienePrincipal,
  tieneNinos,
}: {
  semanaId: string
  semanaTema: string
  semanaFecha: string
  tienePrincipal: boolean
  tieneNinos: boolean
}) {
  const [abierto, setAbierto] = useState(false)
  const [destinatarios, setDestinatarios] = useState<string[]>([])
  const [cargando, setCargando] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  const handleAbrir = () => {
    setAbierto(true)
    setResultado(null)
    // Por defecto, marcar a todos los que existan
    const iniciales: string[] = []
    if (tienePrincipal) iniciales.push('principal')
    if (tieneNinos) iniciales.push('ninos')
    setDestinatarios(iniciales)
  }

  const toggleDestinatario = (valor: string) => {
    setDestinatarios((prev) =>
      prev.includes(valor)
        ? prev.filter((x) => x !== valor)
        : [...prev, valor]
    )
  }

  const handleEnviar = async () => {
    if (destinatarios.length === 0) {
      alert('Selecciona al menos un destinatario')
      return
    }
    setCargando(true)
    setResultado(null)

    try {
      const res = await fetch('/api/cron/recordatorios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semanaId,
          destinatarios,
        }),
      })
      const data = await res.json()
      setResultado(data)
    } catch (err: any) {
      setResultado({ exito: false, mensaje: err.message })
    }
    setCargando(false)
  }

  const cerrar = () => {
    setAbierto(false)
    setResultado(null)
    setDestinatarios([])
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
        className="inline-block px-4 py-2 rounded-lg border border-purple-600 text-purple-600 text-sm font-medium hover:bg-purple-50"
      >
        📧 Enviar recordatorios
      </button>

      {abierto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={cerrar}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-800">
                  📧 Enviar recordatorios
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 capitalize truncate">
                  {fechaFormateada}
                </p>
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {semanaTema}
                </p>
              </div>
              <button
                onClick={cerrar}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!resultado ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      ℹ️ Elige a quién enviar el recordatorio por correo
                      electrónico. Cada maestro recibirá su mensaje personalizado.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destinatarios
                    </label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                          !tienePrincipal
                            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                            : destinatarios.includes('principal')
                              ? 'bg-red-50 border-red-300'
                              : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={destinatarios.includes('principal')}
                          onChange={() => toggleDestinatario('principal')}
                          disabled={!tienePrincipal}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            🧑‍🏫 Maestro principal
                          </p>
                          <p className="text-xs text-gray-500">
                            {tienePrincipal
                              ? 'Incluye tema, versículos, manualidad, actividad de niños y enlace de edición.'
                              : '⚠️ No hay maestro principal asignado'}
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                          !tieneNinos
                            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                            : destinatarios.includes('ninos')
                              ? 'bg-red-50 border-red-300'
                              : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={destinatarios.includes('ninos')}
                          onChange={() => toggleDestinatario('ninos')}
                          disabled={!tieneNinos}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            🧒 Maestro de niños
                          </p>
                          <p className="text-xs text-gray-500">
                            {tieneNinos
                              ? 'Incluye tema, versículo y la actividad para niños pequeños.'
                              : '⚠️ No hay maestro de niños asignado'}
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {destinatarios.length === 0 && (
                    <p className="text-xs text-center text-yellow-700">
                      ⚠️ Selecciona al menos un destinatario
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={handleEnviar}
                      disabled={cargando || destinatarios.length === 0}
                      className="flex-1 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: '#E31E24' }}
                    >
                      {cargando ? 'Enviando...' : '📧 Enviar ahora'}
                    </button>
                    <button
                      onClick={cerrar}
                      disabled={cargando}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">
                      🤖 <strong>Automático:</strong> el sistema envía los
                      recordatorios automáticamente <strong>1 día antes</strong> de cada
                      clase.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={`rounded-lg p-4 border ${
                      resultado.exito
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        resultado.exito
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}
                    >
                      {resultado.mensaje}
                    </p>
                  </div>

                  {resultado.resultados && resultado.resultados.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        Correos enviados:
                      </p>
                      <div className="space-y-1">
                        {resultado.resultados.map((r: any, i: number) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                              r.exito
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
                            }`}
                          >
                            <span>{r.exito ? '✅' : '❌'}</span>
                            <span className="font-medium">{r.rol}:</span>
                            <span className="truncate flex-1">{r.email}</span>
                            {r.error && (
                              <span className="text-xs">({r.error})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
