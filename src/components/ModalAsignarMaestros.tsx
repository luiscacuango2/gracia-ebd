'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Maestro = {
  id: string
  nombres: string
  apellidos: string
  activo: boolean
}

type Modo = 'asignar' | 'modificar'

type Props = {
  semanaId: string
  semanaTema: string
  semanaFecha: string
  maestrosPrincipales: Maestro[]
  maestrosAyudantes: Maestro[]
  maestrosNinos: Maestro[]
  asignacionActual: {
    principal: string
    ayudante: string
    ninos: string
  }
  modo: Modo
  abierto: boolean
  onCerrar: () => void
}

export default function ModalAsignarMaestros({
  semanaId,
  semanaTema,
  semanaFecha,
  maestrosPrincipales,
  maestrosAyudantes,
  maestrosNinos,
  asignacionActual,
  modo,
  abierto,
  onCerrar,
}: Props) {
  const router = useRouter()
  const [asignacion, setAsignacion] = useState({ ...asignacionActual })
  const [comentario, setComentario] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  // Resetear cuando se abre/cierra
  useEffect(() => {
    if (abierto) {
      setAsignacion({ ...asignacionActual })
      setComentario('')
      setMensaje('')
    }
  }, [abierto, asignacionActual])

  const esModificar = modo === 'modificar'

  const hayCambios =
    asignacion.principal !== asignacionActual.principal ||
    asignacion.ayudante !== asignacionActual.ayudante ||
    asignacion.ninos !== asignacionActual.ninos

  const hayAlguienAsignado =
    asignacion.principal || asignacion.ayudante || asignacion.ninos

  // Validar duplicados: mismo maestro en 2 roles
  const hayDuplicado = (() => {
    const ids = [asignacion.principal, asignacion.ayudante, asignacion.ninos].filter(Boolean)
    return new Set(ids).size !== ids.length
  })()

  const nombreDuplicado = (() => {
    if (!hayDuplicado) return null
    const ids = [asignacion.principal, asignacion.ayudante, asignacion.ninos]
    const conteo = new Map<string, number>()
    ids.filter(Boolean).forEach((id) => {
      conteo.set(id, (conteo.get(id) || 0) + 1)
    })
    const dupId = [...conteo.entries()].find(([_, count]) => count > 1)?.[0]
    if (!dupId) return null
    const m = [...maestrosPrincipales, ...maestrosAyudantes, ...maestrosNinos].find(
      (x) => x.id === dupId
    )
    return m ? `${m.nombres} ${m.apellidos}` : 'un maestro'
  })()

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hayDuplicado) {
      setMensaje('⚠️ Un maestro no puede estar en dos roles a la vez.')
      return
    }

    // En modo modificar, el motivo es OBLIGATORIO si hay cambios
    if (esModificar && hayCambios && !comentario.trim()) {
      setMensaje('⚠️ Debes indicar el motivo del cambio')
      return
    }

    setCargando(true)
    setMensaje('')

    const supabase = createClient()

    const { error } = await supabase
      .from('asignaciones')
      .upsert(
        {
          semana_id: semanaId,
          maestro_principal_id: asignacion.principal || null,
          maestro_ayudante_id: asignacion.ayudante || null,
          maestro_ninos_id: asignacion.ninos || null,
        },
        { onConflict: 'semana_id' }
      )

    if (error) {
      setMensaje('❌ Error: ' + error.message)
      setCargando(false)
      return
    }

    // Registrar rotaciones (solo en modo modificar)
    if (esModificar) {
      const cambios: Array<{
        grupo: 'principales' | 'ayudantes' | 'ninos'
        anterior: string
        nuevo: string
      }> = []
      if (asignacion.principal !== asignacionActual.principal) {
        cambios.push({
          grupo: 'principales',
          anterior: asignacionActual.principal,
          nuevo: asignacion.principal,
        })
      }
      if (asignacion.ayudante !== asignacionActual.ayudante) {
        cambios.push({
          grupo: 'ayudantes',
          anterior: asignacionActual.ayudante,
          nuevo: asignacion.ayudante,
        })
      }
      if (asignacion.ninos !== asignacionActual.ninos) {
        cambios.push({
          grupo: 'ninos',
          anterior: asignacionActual.ninos,
          nuevo: asignacion.ninos,
        })
      }

      if (cambios.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: yo } = await supabase
          .from('maestros')
          .select('id')
          .eq('correo', user?.email)
          .single()

        for (const c of cambios) {
          await supabase.from('rotaciones').insert({
            semana_id: semanaId,
            grupo: c.grupo,
            maestro_anterior_id: c.anterior || null,
            maestro_nuevo_id: c.nuevo || null,
            comentario: comentario.trim() || 'Cambio sin motivo registrado',
            creado_por: yo?.id || null,
          })
        }
      }
    }

    onCerrar()
    router.refresh()
  }

  const handleQuitarTodas = async () => {
    if (!confirm('¿Estás seguro de quitar TODOS los maestros asignados a esta semana?')) return

    // Si es modo modificar y hay algo que quitar, pedir motivo
    if (esModificar && !comentario.trim()) {
      setMensaje('⚠️ Debes indicar el motivo antes de quitar los maestros')
      return
    }

    setCargando(true)
    setMensaje('')

    const supabase = createClient()

    const { error } = await supabase
      .from('asignaciones')
      .update({
        maestro_principal_id: null,
        maestro_ayudante_id: null,
        maestro_ninos_id: null,
      })
      .eq('semana_id', semanaId)

    if (error) {
      setMensaje('❌ Error: ' + error.message)
      setCargando(false)
      return
    }

    // Registrar rotaciones
    if (esModificar) {
      const cambios: Array<{
        grupo: 'principales' | 'ayudantes' | 'ninos'
        anterior: string
      }> = []
      if (asignacionActual.principal)
        cambios.push({ grupo: 'principales', anterior: asignacionActual.principal })
      if (asignacionActual.ayudante)
        cambios.push({ grupo: 'ayudantes', anterior: asignacionActual.ayudante })
      if (asignacionActual.ninos)
        cambios.push({ grupo: 'ninos', anterior: asignacionActual.ninos })

      if (cambios.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        const { data: yo } = await supabase
          .from('maestros')
          .select('id')
          .eq('correo', user?.email)
          .single()

        for (const c of cambios) {
          await supabase.from('rotaciones').insert({
            semana_id: semanaId,
            grupo: c.grupo,
            maestro_anterior_id: c.anterior || null,
            maestro_nuevo_id: null,
            comentario: comentario.trim() || 'Se quitaron todos los maestros asignados',
            creado_por: yo?.id || null,
          })
        }
      }
    }

    setAsignacion({ principal: '', ayudante: '', ninos: '' })
    onCerrar()
    router.refresh()
  }

  const handleCerrar = () => {
    setAsignacion({ ...asignacionActual })
    setComentario('')
    setMensaje('')
    onCerrar()
  }

  if (!abierto) return null

  const fechaFormateada = new Date(semanaFecha + 'T12:00:00').toLocaleDateString(
    'es-ES',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  // Filtrar opciones excluyendo las ya seleccionadas + ordenar alfabéticamente
  const filtrarYOrdenar = (lista: Maestro[], excluir: (string | null)[]) =>
    lista
      .filter((m) => !excluir.includes(m.id))
      .sort((a, b) =>
        `${a.nombres} ${a.apellidos}`.localeCompare(
          `${b.nombres} ${b.apellidos}`,
          'es'
        )
      )

  const opcionesPrincipales = filtrarYOrdenar(maestrosPrincipales, [
    asignacion.ayudante,
    asignacion.ninos,
  ])
  const opcionesAyudantes = filtrarYOrdenar(maestrosAyudantes, [
    asignacion.principal,
    asignacion.ninos,
  ])
  const opcionesNinos = filtrarYOrdenar(maestrosNinos, [
    asignacion.principal,
    asignacion.ayudante,
  ])
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleCerrar}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div
          className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10"
          style={{ borderColor: '#E31E24' }}
        >
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-800">
              {esModificar ? '✏️ Modificar asignación' : '👥 Asignar maestros'}
            </h2>
            <p className="text-xs text-gray-500 mt-1 capitalize truncate">
              {fechaFormateada}
            </p>
            <p className="text-sm font-semibold text-gray-700 truncate">
              {semanaTema}
            </p>
          </div>
          <button
            onClick={handleCerrar}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleGuardar} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🧑‍🏫 Maestro principal
            </label>
            {maestrosPrincipales.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded border">
                No hay maestros en el grupo "Principales".{' '}
                <a
                  href="/dashboard/grupos"
                  className="text-red-600 hover:underline"
                >
                  Gestionar grupos
                </a>
              </p>
            ) : (
              <select
                value={asignacion.principal}
                onChange={(e) =>
                  setAsignacion({ ...asignacion, principal: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">— Sin asignar —</option>
                {opcionesPrincipales.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres} {m.apellidos}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🤝 Maestro ayudante
            </label>
            {maestrosAyudantes.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded border">
                No hay maestros en el grupo "Ayudantes".{' '}
                <a
                  href="/dashboard/grupos"
                  className="text-red-600 hover:underline"
                >
                  Gestionar grupos
                </a>
              </p>
            ) : (
              <select
                value={asignacion.ayudante}
                onChange={(e) =>
                  setAsignacion({ ...asignacion, ayudante: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">— Sin asignar —</option>
                {opcionesAyudantes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres} {m.apellidos}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🧒 Maestro de niños
            </label>
            {maestrosNinos.length === 0 ? (
              <p className="text-xs text-gray-500 italic bg-gray-50 px-3 py-2 rounded border">
                No hay maestros en el grupo "Niños pequeños".{' '}
                <a
                  href="/dashboard/grupos"
                  className="text-red-600 hover:underline"
                >
                  Gestionar grupos
                </a>
              </p>
            ) : (
              <select
                value={asignacion.ninos}
                onChange={(e) =>
                  setAsignacion({ ...asignacion, ninos: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">— Sin asignar —</option>
                {opcionesNinos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombres} {m.apellidos}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Advertencia de duplicado */}
          {hayDuplicado && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-1">
                ⚠️ Maestro duplicado
              </p>
              <p className="text-xs text-red-700">
                <strong>{nombreDuplicado}</strong> ya está asignado en otro
                rol. Un maestro no puede ocupar dos funciones en la misma
                semana.
              </p>
            </div>
          )}

          {/* Motivo (solo en modo modificar) */}
          {esModificar && (
            <div
              className={`rounded-lg p-4 border ${
                hayCambios
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <label className="block text-sm font-medium mb-2 text-gray-800">
                📝 Motivo del cambio{' '}
                {hayCambios ? <span className="text-red-600">(obligatorio)</span> : '(opcional)'}
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                placeholder="Ej: El maestro se enfermó y no podrá asistir. Se pidió a X que lo reemplace."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
              {hayCambios && !comentario.trim() && (
                <p className="text-xs text-yellow-700 mt-1">
                  ⚠️ Como cambiaste una asignación, es necesario indicar el
                  motivo.
                </p>
              )}
              {!hayCambios && (
                <p className="text-xs text-gray-500 mt-1">
                  Puedes dejar una nota aunque no haya cambios (quedará registrada en el historial).
                </p>
              )}
            </div>
          )}

          {mensaje && (
            <p className="text-sm text-center text-red-600 font-medium">
              {mensaje}
            </p>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="submit"
              disabled={
                cargando ||
                hayDuplicado ||
                (esModificar && hayCambios && !comentario.trim())
              }
              className="flex-1 px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E31E24' }}
            >
              {cargando
                ? 'Guardando...'
                : esModificar
                  ? 'Guardar cambios'
                  : 'Asignar maestros'}
            </button>

            {esModificar && hayAlguienAsignado && (
              <button
                type="button"
                onClick={handleQuitarTodas}
                disabled={cargando}
                className="px-6 py-2 rounded-lg border-2 border-red-600 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 whitespace-nowrap"
              >
                🗑️ Quitar todos
              </button>
            )}

            <button
              type="button"
              onClick={handleCerrar}
              disabled={cargando}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
