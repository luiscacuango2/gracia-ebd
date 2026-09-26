'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Semana = {
  id: string
  token_publico: string | null
  fecha: string
  tema: string
  pasaje_biblico: string | null
  versiculo_memorizar: string | null
  actividad_ninos: string | null
}

export default function FormActividadNinos({
  semana,
  asignacion,
  mapaMaestros,
}: {
  semana: Semana
  asignacion: any
  mapaMaestros: Map<string, string>
}) {
  const [actividad, setActividad] = useState(semana.actividad_ninos || '')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')
    setGuardado(false)

    const supabase = createClient()

    const { error } = await supabase
      .from('semanas')
      .update({
        actividad_ninos: actividad.trim() || null,
      })
      .eq('id', semana.id)

    if (error) {
      setMensaje('❌ Error: ' + error.message)
    } else {
      setGuardado(true)
      setMensaje('✅ Actividad guardada correctamente')
    }
    setCargando(false)
  }

  const nombreMaestro = (id: string | null | undefined) => {
    if (!id) return null
    return mapaMaestros.get(id) || null
  }

  const principalNombre = nombreMaestro(asignacion?.maestro_principal_id)
  const ayudanteNombre = nombreMaestro(asignacion?.maestro_ayudante_id)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info de la clase (solo lectura) */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs uppercase text-gray-500 font-medium mb-3">
          📖 Información de la clase
        </p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 mb-1">Tema</p>
            <p className="font-semibold text-gray-800">{semana.tema}</p>
          </div>
          {semana.pasaje_biblico && (
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Versículos de estudio
              </p>
              <p className="text-gray-700 text-xs whitespace-pre-wrap">
                {semana.pasaje_biblico}
              </p>
            </div>
          )}
          {semana.versiculo_memorizar && (
            <div>
              <p className="text-xs text-gray-500 mb-1">
                Versículo para memorizar
              </p>
              <p className="text-gray-700 text-xs whitespace-pre-wrap">
                {semana.versiculo_memorizar}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🆕 Equipo de maestros */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs uppercase text-blue-700 font-medium mb-3">
          👥 Equipo de maestros de esta clase
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧑‍🏫</span>
            <div>
              <p className="text-xs text-blue-700">Maestro principal</p>
              <p className="font-medium text-gray-800">
                {principalNombre || (
                  <span className="text-gray-400 italic">Sin asignar</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🤝</span>
            <div>
              <p className="text-xs text-blue-700">Maestro ayudante</p>
              <p className="font-medium text-gray-800">
                {ayudanteNombre || (
                  <span className="text-gray-400 italic">Sin asignar</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario: solo actividad */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <label className="block text-base font-semibold text-gray-800 mb-2">
          🧒 Actividad para niños pequeños
        </label>
        <p className="text-xs text-yellow-800 mb-4">
          💡 Recomendación: que la actividad esté relacionada con el tema de la
          clase (pintar imágenes, juegos, canciones, dinámicas, etc.).
        </p>
        <textarea
          value={actividad}
          onChange={(e) => {
            setActividad(e.target.value)
            setGuardado(false)
          }}
          rows={5}
          placeholder="Ej: Pintar una imagen de Jesús sirviendo a los demás, y jugar a 'servir a mi amigo'."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
        />
      </div>

      {/* Info del maestro de niños asignado */}
      {asignacion?.maestro_ninos_id && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs">
          <p className="text-gray-500">
            👤 Registrando como:{' '}
            <strong className="text-gray-800">
              {nombreMaestro(asignacion.maestro_ninos_id)}
            </strong>
          </p>
        </div>
      )}

      {mensaje && (
        <div
          className={`p-4 rounded-xl text-sm text-center font-medium ${
            guardado
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {mensaje}
        </div>
      )}

      <button
        type="submit"
        disabled={cargando}
        className="w-full py-3 px-4 rounded-xl text-white font-semibold transition disabled:opacity-50 shadow-md hover:shadow-lg"
        style={{ backgroundColor: '#E31E24' }}
      >
        {cargando ? 'Guardando...' : '💾 Guardar actividad'}
      </button>

      <p className="text-xs text-center text-gray-400">
        Solo puedes editar la actividad de niños pequeños. Otros campos son
        gestionados por el maestro principal.
      </p>
    </form>
  )
}
