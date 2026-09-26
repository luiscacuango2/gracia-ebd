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
  manualidad: string | null
  actividad_ninos: string | null
}

export default function FormEdicionPublica({
  semana,
  asignacion,
  mapaMaestros,
}: {
  semana: Semana
  asignacion: any
  mapaMaestros: Map<string, string>
}) {
  const [form, setForm] = useState({
    tema: semana.tema || '',
    pasaje_biblico: semana.pasaje_biblico || '',
    versiculo_memorizar: semana.versiculo_memorizar || '',
    manualidad: semana.manualidad || '',
    actividad_ninos: semana.actividad_ninos || '',
  })
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setGuardado(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')
    setGuardado(false)

    const supabase = createClient()

    const { error } = await supabase
      .from('semanas')
      .update({
        tema: form.tema.trim(),
        pasaje_biblico: form.pasaje_biblico.trim() || null,
        versiculo_memorizar: form.versiculo_memorizar.trim() || null,
        manualidad: form.manualidad.trim() || null,
        actividad_ninos: form.actividad_ninos.trim() || null,
      })
      .eq('id', semana.id)

    if (error) {
      setMensaje('❌ Error: ' + error.message)
    } else {
      setGuardado(true)
      setMensaje('✅ Cambios guardados correctamente')
    }
    setCargando(false)
  }

  const nombreMaestro = (id: string | null | undefined) => {
    if (!id) return 'Sin asignar'
    return mapaMaestros.get(id) || 'Sin asignar'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tema *
        </label>
        <input
          type="text"
          name="tema"
          value={form.tema}
          onChange={handleChange}
          required
          placeholder="Ej: El servicio"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Versículos de estudio
        </label>
        <textarea
          name="pasaje_biblico"
          value={form.pasaje_biblico}
          onChange={handleChange}
          rows={2}
          placeholder="Ej: Mateo 20:26-28, Juan 12:26, Mateo 23:11"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Versículo para memorizar
        </label>
        <textarea
          name="versiculo_memorizar"
          value={form.versiculo_memorizar}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: El más importante entre ustedes será siervo de los demás. Mateo 23:11"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Manualidad
        </label>
        <textarea
          name="manualidad"
          value={form.manualidad}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: Sombreros de cafetería, y servir en el bar de la iglesia."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Actividad de niños */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          🧒 Actividad para niños pequeños
        </label>
        <p className="text-xs text-gray-600 mb-3">
          💡 Recomendación: que la actividad esté relacionada con el tema de la clase
          (ej: pintar imágenes, juegos, canciones, dinámicas).
        </p>
        <textarea
          name="actividad_ninos"
          value={form.actividad_ninos}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: Pintar una imagen de Jesús sirviendo a los demás."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
        />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs uppercase text-gray-500 font-medium mb-2">
          Maestros asignados
        </p>
        <div className="space-y-1 text-xs text-gray-700">
          <p>
            🧑‍🏫 <strong>Principal:</strong>{' '}
            {nombreMaestro(asignacion?.maestro_principal_id)}
          </p>
          <p>
            🤝 <strong>Ayudante:</strong>{' '}
            {nombreMaestro(asignacion?.maestro_ayudante_id)}
          </p>
          <p>
            🧒 <strong>Niños:</strong>{' '}
            {nombreMaestro(asignacion?.maestro_ninos_id)}
          </p>
        </div>
      </div>

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
        {cargando ? 'Guardando...' : '💾 Guardar cambios'}
      </button>

      <p className="text-xs text-center text-gray-400">
        Los cambios se guardan directamente en el sistema.
      </p>
    </form>
  )
}
