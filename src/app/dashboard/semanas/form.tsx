'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BotonIAVersiculos from '@/components/BotonIAVersiculos'

type Semana = {
  id?: string
  fecha?: string
  tema?: string
  pasaje_biblico?: string | null
  versiculo_memorizar?: string | null
  manualidad?: string | null
  actividad_ninos?: string | null
}

export default function SemanaForm({ semana }: { semana?: Semana }) {
  const router = useRouter()
  const esEdicion = !!semana?.id

  const [form, setForm] = useState({
    fecha: semana?.fecha || '',
    tema: semana?.tema || '',
    pasaje_biblico: semana?.pasaje_biblico || '',
    versiculo_memorizar: semana?.versiculo_memorizar || '',
    manualidad: semana?.manualidad || '',
    actividad_ninos: semana?.actividad_ninos || '',
  })
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    const supabase = createClient()

    const datos = {
      fecha: form.fecha,
      tema: form.tema.trim(),
      pasaje_biblico: form.pasaje_biblico.trim() || null,
      versiculo_memorizar: form.versiculo_memorizar.trim() || null,
      manualidad: form.manualidad.trim() || null,
      actividad_ninos: form.actividad_ninos.trim() || null,
    }

    const { error } = esEdicion
      ? await supabase.from('semanas').update(datos).eq('id', semana!.id)
      : await supabase.from('semanas').insert(datos)

    if (error) {
      if (error.code === '23505') {
        setMensaje('⚠️ Ya existe una semana con esa fecha.')
      } else {
        setMensaje('❌ Error: ' + error.message)
      }
      setCargando(false)
    } else {
      router.push('/dashboard/semanas')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!esEdicion) return
    if (!confirm('¿Eliminar esta semana? Se eliminarán también sus asignaciones.')) return
    setCargando(true)
    const supabase = createClient()
    const { error } = await supabase.from('semanas').delete().eq('id', semana!.id)
    if (error) {
      setMensaje('❌ Error: ' + error.message)
      setCargando(false)
    } else {
      router.push('/dashboard/semanas')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha (domingo) *
        </label>
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tema *
        </label>
        <input
          type="text"
          name="tema"
          value={form.tema}
          onChange={handleChange}
          required
          placeholder="Ej: El servicio"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Versículos de estudio
        </label>
        <textarea
          name="pasaje_biblico"
          value={form.pasaje_biblico}
          onChange={handleChange}
          rows={2}
          placeholder="Ej: Mateo 20:26-28, Juan 12:26, Mateo 23:11"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
          <BotonIAVersiculos
            tema={form.tema}
            onSugerencia={(versiculos) => {
              setForm({ ...form, pasaje_biblico: versiculos })
            }}
          />
          <p className="text-xs text-gray-500 italic">
            💡 Los versículos son referenciales y puedes modificarlos cuando desees
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Versículo para memorizar
        </label>
        <textarea
          name="versiculo_memorizar"
          value={form.versiculo_memorizar}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: El más importante entre ustedes será siervo de los demás. Mateo 23:11"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Manualidad
        </label>
        <textarea
          name="manualidad"
          value={form.manualidad}
          onChange={handleChange}
          rows={3}
          placeholder="Ej: Sombreros de cafetería, y servir en el bar de la iglesia."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* 🆕 Actividad para niños pequeños */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
          placeholder="Ej: Pintar una imagen de Jesús sirviendo a los demás, y jugar a 'servir a mi amigo'."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
        />
      </div>

      {mensaje && <p className="text-sm text-center text-gray-700">{mensaje}</p>}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={cargando}
          className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#E31E24' }}
        >
          {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear semana'}
        </button>

        {esEdicion && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={cargando}
            className="px-6 py-2 rounded-lg border border-red-600 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  )
}
