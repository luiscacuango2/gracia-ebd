'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type MaestroGrupo = {
  id: string
  nombres: string
  apellidos: string
  totalPasadas: number
  totalFuturas: number
  totalTodas: number
}

type MaestroSimple = {
  id: string
  nombres: string
  apellidos: string
}

type Semana = {
  id: string
  fecha: string
  tema: string
  pasaje_biblico: string | null
  versiculo_memorizar: string | null
  manualidad: string | null
  actividad_ninos: string | null
  asignacion: any
}

type PeriodoConteo = 'todas' | 'pasadas' | 'futuras'

export default function RotacionCliente({
  semanas,
  todosMaestros,
  gruposInfo,
}: {
  semanas: Semana[]
  todosMaestros: MaestroSimple[]
  gruposInfo: {
    principales: MaestroGrupo[]
    ayudantes: MaestroGrupo[]
    ninos: MaestroGrupo[]
  }
}) {
  const router = useRouter()
  const [modalConfirmacion, setModalConfirmacion] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [periodoConteo, setPeriodoConteo] = useState<PeriodoConteo>('futuras')
  const [resultado, setResultado] = useState<{
    exito: boolean
    mensaje: string
    asignadas: number
    detalle: Array<{
      fecha: string
      tema: string
      principal: string
      ayudante: string
      ninos: string
      cambio: boolean
      nota?: string
    }>
  } | null>(null)

  const mapaMaestros = new Map(todosMaestros.map((m) => [m.id, m]))

  const nombreDe = (id: string | null | undefined) => {
    if (!id) return null
    const m = mapaMaestros.get(id)
    return m ? `${m.nombres} ${m.apellidos}` : null
  }

  const sinTema = semanas.filter(
    (s) => !s.tema?.trim() || s.tema === 'Por definir'
  )
  const sinAsignar = semanas.filter(
    (s) =>
      !s.asignacion?.maestro_principal_id ||
      !s.asignacion?.maestro_ayudante_id ||
      !s.asignacion?.maestro_ninos_id
  )
  const completas = semanas.filter(
    (s) =>
      s.asignacion?.maestro_principal_id &&
      s.asignacion?.maestro_ayudante_id &&
      s.asignacion?.maestro_ninos_id
  )

  const totalGrupos =
    gruposInfo.principales.length +
    gruposInfo.ayudantes.length +
    gruposInfo.ninos.length

  // 🆕 Obtener el total según el periodo seleccionado
  const getTotalPorPeriodo = (m: MaestroGrupo) => {
    if (periodoConteo === 'pasadas') return m.totalPasadas
    if (periodoConteo === 'futuras') return m.totalFuturas
    return m.totalTodas
  }

  const maxUsoGrupo = {
    principales: Math.max(
      ...gruposInfo.principales.map((m) => getTotalPorPeriodo(m)),
      1
    ),
    ayudantes: Math.max(
      ...gruposInfo.ayudantes.map((m) => getTotalPorPeriodo(m)),
      1
    ),
    ninos: Math.max(
      ...gruposInfo.ninos.map((m) => getTotalPorPeriodo(m)),
      1
    ),
  }

  const promedioUso = (grupo: MaestroGrupo[]) => {
    if (grupo.length === 0) return 0
    const total = grupo.reduce((acc, m) => acc + getTotalPorPeriodo(m), 0)
    return Math.round((total / grupo.length) * 10) / 10
  }

  if (totalGrupos === 0) {
    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          🎲 Rotación automática
        </h1>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <p className="text-yellow-800 font-medium mb-2">
            ⚠️ No hay maestros asignados a ningún grupo
          </p>
          <p className="text-sm text-yellow-700 mb-4">
            Para usar la rotación automática, primero debes asignar maestros a
            los grupos (Principales, Ayudantes, Niños pequeños).
          </p>
          <Link
            href="/dashboard/grupos"
            className="inline-block px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: '#E31E24' }}
          >
            Ir a Grupos de maestros
          </Link>
        </div>
      </div>
    )
  }

  const handleAbrirConfirmacion = () => {
    setResultado(null)
    setModalConfirmacion(true)
  }

  const handleGenerar = async () => {
    setGenerando(true)
    const res = await fetch('/api/rotacion-automatica', {
      method: 'POST',
    })
    const data = await res.json()
    setResultado(data)
    setGenerando(false)
    router.refresh()
  }

  const cerrarModal = () => {
    setModalConfirmacion(false)
    setResultado(null)
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/semanas"
          className="text-red-600 hover:underline text-sm"
        >
          ← Volver a semanas
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            🎲 Rotación automática
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Asigna maestros de forma equilibrada a las semanas futuras.
          </p>
        </div>
        <button
          onClick={handleAbrirConfirmacion}
          disabled={semanas.length === 0}
          className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 whitespace-nowrap"
          style={{ backgroundColor: '#E31E24' }}
        >
          🎲 Generar asignaciones
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: '#E31E24' }}>
          <p className="text-sm text-gray-500">Semanas futuras</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {semanas.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: '#E31E24' }}>
          <p className="text-sm text-gray-500">Faltan asignar</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {sinAsignar.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: '#E31E24' }}>
          <p className="text-sm text-gray-500">Completas</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">
            {completas.length}
          </p>
        </div>
      </div>

      {/* ===== MAESTROS DISPONIBLES POR GRUPO ===== */}
      <div className="bg-white rounded-lg shadow p-5 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              👥 Maestros disponibles por grupo
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              El conteo refleja las <strong>clases dadas</strong> según el
              periodo seleccionado.
            </p>
          </div>

{/* Filtro de periodo */}
<div className="flex gap-1 flex-wrap">
  <button
    onClick={() => setPeriodoConteo('futuras')}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
      periodoConteo === 'futuras'
        ? 'text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    style={periodoConteo === 'futuras' ? { backgroundColor: '#E31E24' } : {}}
  >
    📅 Futuras
  </button>
  <button
    onClick={() => setPeriodoConteo('pasadas')}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
      periodoConteo === 'pasadas'
        ? 'text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    style={periodoConteo === 'pasadas' ? { backgroundColor: '#E31E24' } : {}}
  >
    📖 Pasadas
  </button>
  <button
    onClick={() => setPeriodoConteo('todas')}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
      periodoConteo === 'todas'
        ? 'text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
    style={periodoConteo === 'todas' ? { backgroundColor: '#E31E24' } : {}}
  >
    📋 Todas
  </button>
</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GrupoMaestros
            titulo="🧑‍🏫 Principales"
            color="#E31E24"
            maestros={gruposInfo.principales}
            maxUso={maxUsoGrupo.principales}
            promedio={promedioUso(gruposInfo.principales)}
            getTotal={getTotalPorPeriodo}
            periodoLabel={periodoConteo}
          />
          <GrupoMaestros
            titulo="🤝 Ayudantes"
            color="#3B82F6"
            maestros={gruposInfo.ayudantes}
            maxUso={maxUsoGrupo.ayudantes}
            promedio={promedioUso(gruposInfo.ayudantes)}
            getTotal={getTotalPorPeriodo}
            periodoLabel={periodoConteo}
          />
          <GrupoMaestros
            titulo="🧒 Niños pequeños"
            color="#10B981"
            maestros={gruposInfo.ninos}
            maxUso={maxUsoGrupo.ninos}
            promedio={promedioUso(gruposInfo.ninos)}
            getTotal={getTotalPorPeriodo}
            periodoLabel={periodoConteo}
          />
        </div>
      </div>

      {/* Advertencias */}
      {sinTema.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800 font-medium mb-1">
            ⚠️ {sinTema.length} semana{sinTema.length === 1 ? '' : 's'} sin tema
            registrado
          </p>
          <p className="text-xs text-yellow-700">
            El sistema asignará maestros igual, pero es recomendable registrar
            el tema antes.
          </p>
        </div>
      )}

      {/* Listado de semanas */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Semanas futuras ({semanas.length})
        </h2>

        {semanas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">
              No hay semanas futuras registradas.
            </p>
            <Link
              href="/dashboard/semanas/nueva"
              className="inline-block px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#E31E24' }}
            >
              Crear primera semana
            </Link>
          </div>
        ) : (
          semanas.map((s) => {
            const fecha = new Date(s.fecha + 'T12:00:00')
            const sinTemaSemana = !s.tema?.trim() || s.tema === 'Por definir'
            const principalId = s.asignacion?.maestro_principal_id
            const ayudanteId = s.asignacion?.maestro_ayudante_id
            const ninosId = s.asignacion?.maestro_ninos_id

            return (
              <div
                key={s.id}
                className="bg-white rounded-lg shadow p-4 border-l-4"
                style={{ borderColor: '#E31E24' }}
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase text-gray-500 font-medium">
                      {fecha.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <h3
                      className={`font-bold mt-1 break-words ${
                        sinTemaSemana
                          ? 'text-gray-400 italic'
                          : 'text-gray-800'
                      }`}
                    >
                      {sinTemaSemana ? '(Sin tema registrado)' : s.tema}
                    </h3>
                  </div>
                  <Link
                    href={`/dashboard/semanas/${s.id}`}
                    className="text-red-600 hover:underline text-sm font-medium whitespace-nowrap"
                  >
                    Editar
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span>🧑‍🏫</span>
                    {principalId ? (
                      <span className="text-gray-700 truncate">
                        {nombreDe(principalId)}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Sin asignar</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🤝</span>
                    {ayudanteId ? (
                      <span className="text-gray-700 truncate">
                        {nombreDe(ayudanteId)}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Sin asignar</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🧒</span>
                    {ninosId ? (
                      <span className="text-gray-700 truncate">
                        {nombreDe(ninosId)}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Sin asignar</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t text-xs">
                  <p className="text-gray-400 uppercase font-medium mb-1">
                    🧒 Actividad niños
                  </p>
                  <p className="text-gray-700">
                    {s.actividad_ninos || (
                      <span className="text-gray-400 italic">Sin registrar</span>
                    )}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ===== MODAL ===== */}
      {modalConfirmacion && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={cerrarModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {resultado
                  ? '✅ Resultado'
                  : '🎲 Confirmar rotación automática'}
              </h2>
              <button
                onClick={cerrarModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {!resultado ? (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900 font-medium mb-3">
                      📊 Resumen de la operación:
                    </p>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Semanas futuras totales:</span>
                        <strong>{semanas.length}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Faltan asignar maestros:</span>
                        <strong className="text-yellow-700">
                          {sinAsignar.length}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Ya completas:</span>
                        <strong className="text-green-700">
                          {completas.length}
                        </strong>
                      </div>
                      {sinTema.length > 0 && (
                        <div className="flex justify-between">
                          <span>Sin tema registrado:</span>
                          <strong className="text-yellow-700">
                            {sinTema.length}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">
                      ℹ️ ¿Qué hará el sistema?
                    </p>
                    <ul className="text-xs text-gray-700 space-y-1.5 list-disc list-inside">
                      <li>
                        Asignará maestros solo a las{' '}
                        <strong>semanas que estén vacías</strong>.
                      </li>
                      <li>
                        <strong>Respeta</strong> las asignaciones manuales
                        existentes.
                      </li>
                      <li>
                        Prioriza a quien{' '}
                        <strong>menos ha servido</strong> históricamente.
                      </li>
                      <li>
                        <strong>Regla de descanso:</strong> un maestro que
                        sirvió una semana{' '}
                        <strong>no puede servir en las 4 semanas siguientes</strong>,
                        en ningún rol.
                      </li>
                      <li>
                        <strong>Restricciones:</strong> respeta las parejas y
                        maestros que no pueden servir juntos.
                      </li>
                      <li>
                        <strong>Ausencias:</strong> no asigna a maestros que
                        estén de ausencia en esa fecha.
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleGenerar}
                      disabled={generando}
                      className="flex-1 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                      style={{ backgroundColor: '#E31E24' }}
                    >
                      {generando ? 'Generando...' : 'Confirmar y asignar'}
                    </button>
                    <button
                      onClick={cerrarModal}
                      disabled={generando}
                      className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
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
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${
                        resultado.exito ? 'text-green-800' : 'text-red-800'
                      }`}
                    >
                      {resultado.mensaje}
                    </p>
                  </div>

                  {resultado.detalle.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Detalle por semana:
                      </p>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {resultado.detalle.map((d, i) => (
                          <div
                            key={i}
                            className={`rounded-lg p-3 border ${
                              d.cambio
                                ? 'bg-white border-red-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2 gap-2">
                              <p className="text-xs text-gray-500">
                                {new Date(
                                  d.fecha + 'T12:00:00'
                                ).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                })}
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  d.cambio
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {d.cambio ? 'Actualizada' : 'Sin cambios'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-gray-800 mb-2 break-words">
                              {d.tema}
                            </p>
                            <div className="space-y-1 text-xs text-gray-700">
                              <p>
                                🧑‍🏫 <strong>Principal:</strong> {d.principal}
                              </p>
                              <p>
                                🤝 <strong>Ayudante:</strong> {d.ayudante}
                              </p>
                              <p>
                                🧒 <strong>Niños:</strong> {d.ninos}
                              </p>
                            </div>

    {d.nota && (
      <p className="text-xs text-yellow-700 mt-2 pt-2 border-t border-yellow-200">
        {d.nota}
      </p>
    )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={cerrarModal}
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
    </div>
  )
}

// ===== COMPONENTE: Grupo de maestros =====
function GrupoMaestros({
  titulo,
  color,
  maestros,
  maxUso,
  promedio,
  getTotal,
  periodoLabel,
}: {
  titulo: string
  color: string
  maestros: MaestroGrupo[]
  maxUso: number
  promedio: number
  getTotal: (m: MaestroGrupo) => number
  periodoLabel: string
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3 pb-2 border-b">
        <p className="text-sm font-semibold text-gray-800">{titulo}</p>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {maestros.length}
        </span>
      </div>

      {maestros.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-4 text-center">
          Sin maestros asignados
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-3 max-h-72 overflow-y-auto">
            {maestros.map((m) => {
              const total = getTotal(m)
              const porcentaje = maxUso > 0 ? (total / maxUso) * 100 : 0
              return (
                <div
                  key={m.id}
                  className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <p className="text-xs text-gray-800 font-medium truncate">
                      {m.nombres} {m.apellidos}
                    </p>
                    <span
                      className="text-xs font-bold whitespace-nowrap"
                      style={{ color }}
                    >
                      {total} clase{total === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${porcentaje}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-3 border-t flex justify-between text-xs">
            <span className="text-gray-500">
              Promedio {periodoLabel === 'todas' ? 'total' : periodoLabel}:
            </span>
            <span className="font-bold text-gray-700">
              {promedio} clase{promedio === 1 ? '' : 's'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
