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
}

export default function PerfilForm({ maestro }: { maestro: Maestro }) {
  const router = useRouter()
  const [form, setForm] = useState({
    nombres: maestro.nombres,
    apellidos: maestro.apellidos,
    celular: maestro.celular || '',
    fecha_nacimiento: maestro.fecha_nacimiento || '',
    comida_favorita: maestro.comida_favorita || '',
  })
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
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
        celular: celularLimpio || null,
        fecha_nacimiento: form.fecha_nacimiento || null,
        comida_favorita: form.comida_favorita.trim() || null,
      })
      .eq('id', maestro.id)

    if (error) {
      setMensaje('❌ Error: ' + error.message)
    } else {
      setMensaje('✅ Datos actualizados correctamente')
      router.refresh()
    }
    setCargando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          📧 Tu correo (<strong>{maestro.correo}</strong>) está ligado a tu cuenta.
          Para cambiarlo, contacta al administrador.
        </p>
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número de celular</label>
        <input type="tel" name="celular" value={form.celular} onChange={handleChange} placeholder="Ej: 0991234567" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comida favorita</label>
          <input type="text" name="comida_favorita" value={form.comida_favorita} onChange={handleChange} placeholder="Ej: Encebollado" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-lg text-sm ${mensaje.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {mensaje}
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button type="submit" disabled={cargando} className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50" style={{ backgroundColor: '#E31E24' }}>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
