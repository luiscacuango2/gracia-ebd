'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Maestro = {
  id: string
  nombres: string
  apellidos: string
  activo: boolean
}

type Restriccion = {
  id: string
  maestro_1_id: string | null
  maestro_2_id: string | null
  motivo: string | null
}

type Ausencia = {
  id: string
  maestro_id: string | null
  fecha_desde: string
  fecha_hasta: string
  motivo: string | null
}

export default function RestriccionesCliente({
  maestros,
  restricciones,
  ausencias,
}: {
  maestros: Maestro[]
  restricciones: Restriccion[]
  ausencias: Ausencia[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'restricciones' | 'ausencias'>('restricciones')

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        🚫 Restricciones y ausencias
      </h1>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Configura reglas que afectan la rotación automática de maestros.
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setTab('restricciones')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'restricciones'
              ? 'text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          style={tab === 'restricciones' ? { backgroundColor: '#E31E24' } : {}}
        >
          👫 Restricciones ({restricciones.length})
        </button>
        <button
          onClick={() => setTab('ausencias')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            tab === 'ausencias'
              ? 'text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          style={tab === 'ausencias' ? { backgroundColor: '#E31E24' } : {}}
        >
          🏖️ Ausencias ({ausencias.length})
        </button>
      </div>

      {tab === 'restricciones' && (
        <RestriccionesTab
          maestros={maestros}
          restricciones={restricciones}
          onRefresh={() => router.refresh()}
        />
      )}

      {tab === 'ausencias' && (
        <AusenciasTab
          maestros={maestros}
          ausencias={ausencias}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  )
}

// =========================================================
// TAB DE RESTRICCIONES
// =========================================================
function RestriccionesTab({
  maestros,
  restricciones,
  onRefresh,
}: {
  maestros: Maestro[]
  restricciones: Restriccion[]
  onRefresh: () => void
}) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [maestro1, setMaestro1] = useState('')
  const [maestro2, setMaestro2] = useState('')
  const [motivo, setMotivo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const mapaMaestros = new Map(
    maestros.map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )

  const handleGuardar = async () => {
    if (!maestro1 || !maestro2) {
      setMensaje('⚠️ Debes seleccionar dos maestros')
      return
    }
    if (maestro1 === maestro2) {
      setMensaje('⚠️ No puedes seleccionar el mismo maestro dos veces')
      return
    }

    setCargando(true)
    setMensaje('')
    const supabase = createClient()

    // Ordenar IDs para evitar duplicados (A,B) vs (B,A)
    const [m1, m2] = [maestro1, maestro2].sort()

    const { error } = await supabase.from('restricciones_maestros').insert({
      maestro_1_id: m1,
      maestro_2_id: m2,
      motivo: motivo.trim() || null,
    })

    if (error) {
      if (error.code === '23505') {
        setMensaje('⚠️ Esta restricción ya existe')
      } else {
        setMensaje('❌ Error: ' + error.message)
      }
      setCargando(false)
      return
    }

    setMaestro1('')
    setMaestro2('')
    setMotivo('')
    setMostrarModal(false)
    setCargando(false)
    onRefresh()
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta restricción?')) return
    const supabase = createClient()
    await supabase.from('restricciones_maestros').delete().eq('id', id)
    onRefresh()
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              👫 Restricciones de pareja
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Define qué maestros no pueden servir la misma semana (parejas,
              familias, etc.)
            </p>
          </div>
          <button
            onClick={() => {
              setMensaje('')
              setMostrarModal(true)
            }}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#E31E24' }}
          >
            + Nueva restricción
          </button>
        </div>

        {restricciones.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No hay restricciones configuradas.
          </p>
        ) : (
          <div className="space-y-2">
            {restricciones.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    🚫 {mapaMaestros.get(r.maestro_1_id || '') || '—'} +{' '}
                    {mapaMaestros.get(r.maestro_2_id || '') || '—'}
                  </p>
                  {r.motivo && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.motivo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleEliminar(r.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva restricción */}
      {mostrarModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                👫 Nueva restricción
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maestro 1
                </label>
                <select
                  value={maestro1}
                  onChange={(e) => setMaestro1(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">— Seleccionar —</option>
                  {maestros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maestro 2
                </label>
                <select
                  value={maestro2}
                  onChange={(e) => setMaestro2(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">— Seleccionar —</option>
                  {maestros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Son esposos"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              {mensaje && (
                <p className="text-sm text-center text-red-600">{mensaje}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleGuardar}
                  disabled={cargando}
                  className="flex-1 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#E31E24' }}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// =========================================================
// TAB DE AUSENCIAS
// =========================================================
function AusenciasTab({
  maestros,
  ausencias,
  onRefresh,
}: {
  maestros: Maestro[]
  ausencias: Ausencia[]
  onRefresh: () => void
}) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [maestroId, setMaestroId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [motivo, setMotivo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const mapaMaestros = new Map(
    maestros.map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )

  const handleGuardar = async () => {
    if (!maestroId || !fechaDesde || !fechaHasta) {
      setMensaje('⚠️ Todos los campos son obligatorios')
      return
    }
    if (fechaDesde > fechaHasta) {
      setMensaje('⚠️ La fecha "desde" no puede ser mayor que "hasta"')
      return
    }

    setCargando(true)
    setMensaje('')
    const supabase = createClient()

    const { error } = await supabase.from('ausencias_maestros').insert({
      maestro_id: maestroId,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      motivo: motivo.trim() || null,
    })

    if (error) {
      setMensaje('❌ Error: ' + error.message)
      setCargando(false)
      return
    }

    setMaestroId('')
    setFechaDesde('')
    setFechaHasta('')
    setMotivo('')
    setMostrarModal(false)
    setCargando(false)
    onRefresh()
  }

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta ausencia?')) return
    const supabase = createClient()
    await supabase.from('ausencias_maestros').delete().eq('id', id)
    onRefresh()
  }

  const formatFecha = (f: string) =>
    new Date(f + 'T12:00:00').toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              🏖️ Ausencias de maestros
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Registra las fechas en que un maestro no estará disponible.
              No se le asignará en la rotación automática durante ese periodo.
            </p>
          </div>
          <button
            onClick={() => {
              setMensaje('')
              setMostrarModal(true)
            }}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#E31E24' }}
          >
            + Nueva ausencia
          </button>
        </div>

        {ausencias.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No hay ausencias registradas.
          </p>
        ) : (
          <div className="space-y-2">
            {ausencias.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    👤 {mapaMaestros.get(a.maestro_id || '') || '—'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📅 Del {formatFecha(a.fecha_desde)} al{' '}
                    {formatFecha(a.fecha_hasta)}
                  </p>
                  {a.motivo && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {a.motivo}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleEliminar(a.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva ausencia */}
      {mostrarModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setMostrarModal(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                🏖️ Nueva ausencia
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maestro *
                </label>
                <select
                  value={maestroId}
                  onChange={(e) => setMaestroId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">— Seleccionar —</option>
                  {maestros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombres} {m.apellidos}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desde *
                  </label>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hasta *
                  </label>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo (opcional)
                </label>
                <input
                  type="text"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ej: Viaje familiar, salud, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              {mensaje && (
                <p className="text-sm text-center text-red-600">{mensaje}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleGuardar}
                  disabled={cargando}
                  className="flex-1 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{ backgroundColor: '#E31E24' }}
                >
                  {cargando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
