'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Maestro = {
  id: string
  nombres: string
  apellidos: string
  correo: string
  celular: string | null
  fecha_nacimiento: string | null
  comida_favorita: string | null
  rol: string
  activo: boolean
}

export default function EditarMaestroForm({ maestro }: { maestro: Maestro }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nombres: maestro.nombres,
    apellidos: maestro.apellidos,
    correo: maestro.correo,
    celular: maestro.celular || '',
    fecha_nacimiento: maestro.fecha_nacimiento || '',
    comida_favorita: maestro.comida_favorita || '',
    rol: maestro.rol,
    activo: maestro.activo,
  })
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
    setForm({ ...form, [e.target.name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    const supabase = createClient()
    const celularLimpio = form.celular.replace(/\D/g, '')

    const { error } = await supabase
      .from('maestros')
      .update({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        correo: form.correo.trim().toLowerCase(),
        celular: celularLimpio || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        comida_favorita: form.comida_favorita.trim() || null,
        rol: form.rol,
        activo: form.activo,
      })
      .eq('id', maestro.id)

    if (error) {
      setMensaje('❌ Error: ' + error.message)
      setCargando(false)
    } else {
      router.push('/dashboard/maestros')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este maestro? Esta acción no se puede deshacer.')) return
    setCargando(true)
    const supabase = createClient()
    const { error } = await supabase.from('maestros').delete().eq('id', maestro.id)
    if (error) {
      setMensaje('❌ Error: ' + error.message)
      setCargando(false)
    } else {
      router.push('/dashboard/maestros')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
          <input type="text" name="nombres" value={form.nombres} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
          <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
          <input type="email" name="correo" value={form.correo} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de celular</label>
          <input type="tel" name="celular" value={form.celular} onChange={handleChange} placeholder="Ej: 0991234567" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comida favorita</label>
          <input type="text" name="comida_favorita" value={form.comida_favorita} onChange={handleChange} placeholder="Ej: Encebollado, Pizza" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select name="rol" value={form.rol} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
            <option value="maestro">Maestro</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="w-4 h-4" />
            <span className="text-sm text-gray-700">Maestro activo</span>
          </label>
        </div>
      </div>

      {mensaje && <p className="text-sm text-center text-gray-700">{mensaje}</p>}

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={cargando} className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ backgroundColor: '#E31E24' }}>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={handleDelete} disabled={cargando} className="px-6 py-2 rounded-lg border border-red-600 text-red-600 font-medium hover:bg-red-50 disabled:opacity-50">
          Eliminar
        </button>
      </div>
    </form>
  )
}
