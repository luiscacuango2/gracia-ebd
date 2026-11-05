'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { guardarPuntosSemana } from './acciones'
import { BotonQR } from './BotonQR'
import Link from 'next/link'

type Semana = {
  id: string
  fecha: string
  tema: string
}

type Nino = {
  id: string
  nombres: string
  apellidos: string
  codigo_secreto: string
}

type Punto = {
  nino_id: string
  asistencia: boolean
  comportamiento: boolean
  versiculo: boolean
  observacion: string
}

// Fila tal como viene de Supabase (puede tener nulls)
type PuntoDB = {
  nino_id: string
  asistencia: boolean | null
  comportamiento: boolean | null
  versiculo: boolean | null
  observacion: string | null
}

type CampoEstrella = 'asistencia' | 'comportamiento' | 'versiculo'

export default function PuntosCliente({
  semanas,
  ninos,
  puntosSemana,
  semanaSeleccionada,
  esAdmin,
  puedeEditar,
}: {
  semanas: Semana[]
  ninos: Nino[]
  puntosSemana: PuntoDB[]
  semanaSeleccionada: string
  esAdmin: boolean
  puedeEditar: boolean
}) {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // ✅ Función pura: construye el Map a partir de props
  const construirMapa = (
    ninos: Nino[],
    puntosSemana: PuntoDB[]
  ): Map<string, Punto> => {
    const map = new Map<string, Punto>()

    for (const p of puntosSemana) {
      map.set(p.nino_id, {
        nino_id: p.nino_id,
        asistencia: p.asistencia ?? false,
        comportamiento: p.comportamiento ?? false,
        versiculo: p.versiculo ?? false,
        observacion: p.observacion ?? '',
      })
    }

    for (const n of ninos) {
      if (!map.has(n.id)) {
        map.set(n.id, {
          nino_id: n.id,
          asistencia: false,
          comportamiento: false,
          versiculo: false,
          observacion: '',
        })
      }
    }

    return map
  }

  // ✅ useState con inicializador perezoso correcto
  const [puntos, setPuntos] = useState<Map<string, Punto>>(
    () => construirMapa(ninos, puntosSemana)
  )

  // ✅ Reconstruir cuando cambia la semana o los datos del servidor
  useEffect(() => {
    setPuntos(construirMapa(ninos, puntosSemana))
    setMensaje('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaSeleccionada, puntosSemana])

  const semanaActual = semanas.find((s) => s.id === semanaSeleccionada)

  // ✅ Cálculo de fechas extraído y memoizado
  const fechaSemana = useMemo(() => {
    if (!semanaActual) return null
    const d = new Date(semanaActual.fecha + 'T12:00:00')
    d.setHours(0, 0, 0, 0)
    return d
  }, [semanaActual])

  const { esSemanaHoy, esProximaSemana } = useMemo(() => {
    if (!fechaSemana) return { esSemanaHoy: false, esProximaSemana: false }
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const diff = fechaSemana.getTime() - hoy.getTime()
    return {
      esSemanaHoy: diff === 0,
      esProximaSemana: diff > 0,
    }
  }, [fechaSemana])

  const toggleEstrella = (ninoId: string, campo: CampoEstrella) => {
    if (!puedeEditar) return
    setPuntos((prev) => {
      const nuevos = new Map(prev)
      const actual = nuevos.get(ninoId)
      if (!actual) return prev
      nuevos.set(ninoId, { ...actual, [campo]: !actual[campo] })
      return nuevos
    })
  }

  const cambiarObservacion = (ninoId: string, texto: string) => {
    if (!puedeEditar) return
    setPuntos((prev) => {
      const nuevos = new Map(prev)
      const actual = nuevos.get(ninoId)
      if (!actual) return prev
      nuevos.set(ninoId, { ...actual, observacion: texto })
      return nuevos
    })
  }

  const handleGuardar = async () => {
    if (!semanaSeleccionada) return
    setCargando(true)
    setMensaje('')

    const res = await guardarPuntosSemana({
      semanaId: semanaSeleccionada,
      puntos: Array.from(puntos.values()),
    })

    setMensaje(res.exito ? '✅ ' + res.mensaje : '❌ ' + res.mensaje)
    setCargando(false)

    if (res.exito) {
      router.refresh()
    }
  }

  const cambiarSemana = (id: string) => {
    router.push(`/dashboard/puntos?semana=${id}`)
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            ⭐ Puntos de Niños
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Registra las estrellas semanales de: Asistencia, Comportamiento y Versículo.
          </p>
        </div>

        {/* 🆕 Botón para imprimir QRs (solo admin) */}
        {esAdmin && (
          <Link
            href="/dashboard/ninos/imprimir-qr"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            🖨️ Imprimir QRs
          </Link>
        )}
      </div>

      {/* Selector de semana */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <label className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 items-center gap-2 flex-wrap">
          📅 Selecciona la semana:
          {esSemanaHoy && (
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
              🔴 HOY
            </span>
          )}
          {esProximaSemana && !esSemanaHoy && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
              📅 PRÓXIMA
            </span>
          )}
        </label>
        <select
          value={semanaSeleccionada}
          onChange={(e) => cambiarSemana(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {semanas.length === 0 && <option value="">No hay semanas registradas</option>}
          {semanas.map((s) => (
            <option key={s.id} value={s.id}>
              {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              - {s.tema}
            </option>
          ))}
        </select>
        {semanaActual && !puedeEditar && (
          <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              🔒 Solo el maestro principal de esta semana o el admin pueden registrar puntos.
            </p>
          </div>
        )}
      </div>

      {/* Listado de niños */}
      {ninos.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No hay niños registrados. Contacta al administrador.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ninos.map((nino) => {
            const p = puntos.get(nino.id) ?? {
              nino_id: nino.id,
              asistencia: false,
              comportamiento: false,
              versiculo: false,
              observacion: '',
            }
            const total =
              (p.asistencia ? 1 : 0) +
              (p.comportamiento ? 1 : 0) +
              (p.versiculo ? 1 : 0)

            return (
              <div
                key={nino.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-3"
              >
                {/* 🆕 Fila superior: Nombre, Estrellas, Botones y QR */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                  {/* Info del niño y QR */}
                  <div className="flex items-center gap-4">
                    <BotonQR codigoSecreto={nino.codigo_secreto} nombreNino={nino.nombres} />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100 truncate">
                        {nino.nombres} {nino.apellidos}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {total} ⭐ esta semana
                      </p>
                    </div>
                  </div>

                  {/* Botones de estrellas */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => toggleEstrella(nino.id, 'asistencia')}
                      disabled={!puedeEditar}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${p.asistencia
                          ? 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-300'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {p.asistencia ? '⭐' : '☆'} Asistencia
                    </button>
                    <button
                      onClick={() => toggleEstrella(nino.id, 'comportamiento')}
                      disabled={!puedeEditar}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${p.comportamiento
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-300'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {p.comportamiento ? '⭐' : '☆'} Comportamiento
                    </button>
                    <button
                      onClick={() => toggleEstrella(nino.id, 'versiculo')}
                      disabled={!puedeEditar}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${p.versiculo
                          ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-800 dark:text-purple-300'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                        } ${!puedeEditar ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {p.versiculo ? '⭐' : '☆'} Versículo
                    </button>
                  </div>
                </div>

                {/* 🆕 Fila inferior: Observación */}
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Observación (opcional)..."
                    value={p.observacion || ''}
                    onChange={(e) => cambiarObservacion(nino.id, e.target.value)}
                    disabled={!puedeEditar}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Botón Guardar */}
      {puedeEditar && ninos.length > 0 && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleGuardar}
            disabled={cargando || !semanaSeleccionada}
            className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
            style={{ backgroundColor: '#E31E24' }}
          >
            {cargando ? 'Guardando...' : '💾 Guardar puntos'}
          </button>
          {mensaje && (
            <p className="self-center text-sm text-gray-700 dark:text-gray-300">{mensaje}</p>
          )}
        </div>
      )}
    </div>
  )
}