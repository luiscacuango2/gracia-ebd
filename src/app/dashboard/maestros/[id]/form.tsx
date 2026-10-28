'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

  // 🆕 Clases reutilizables para no repetir tanto
  const inputClass = "w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombres</label>
          <input type="text" name="nombres" value={form.nombres} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Apellidos</label>
          <input type="text" name="apellidos" value={form.apellidos} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Correo</label>
          <input type="email" name="correo" value={form.correo} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Número de celular</label>
          <input type="tel" name="celular" value={form.celular} onChange={handleChange} placeholder="Ej: 0991234567" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Fecha de nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Comida favorita</label>
          <input type="text" name="comida_favorita" value={form.comida_favorita} onChange={handleChange} placeholder="Ej: Encebollado, Pizza" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Rol</label>
          <select name="rol" value={form.rol} onChange={handleChange} className={inputClass}>
            <option value="maestro">Maestro</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="activo" checked={form.activo} onChange={handleChange} className="w-4 h-4 accent-red-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Maestro activo</span>
          </label>
        </div>
      </div>

      {mensaje && <p className="text-sm text-center font-medium text-red-600 dark:text-red-400">{mensaje}</p>}

      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
        <button type="submit" disabled={cargando} className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 transition-colors" style={{ backgroundColor: '#E31E24' }}>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <Link
          href="/dashboard/maestros"
          className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 text-center transition-colors"
        >
          Cancelar
        </Link>
        <button type="button" onClick={handleDelete} disabled={cargando} className="px-6 py-2 rounded-lg border border-red-600 dark:border-red-500 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors">
          Eliminar
        </button>
      </div>

    </form>
  )
}