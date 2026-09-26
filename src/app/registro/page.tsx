'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    celular: '',
    fecha_nacimiento: '',
    comida_favorita: '',
  })
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [exito, setExito] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    const supabase = createClient()

    // Limpiar celular: solo dígitos
    const celularLimpio = form.celular.replace(/\D/g, '')

    const { error } = await supabase.from('maestros').insert({
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim().toLowerCase(),
      celular: celularLimpio || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      comida_favorita: form.comida_favorita.trim() || null,
      rol: 'maestro',
    })

    if (error) {
      if (error.code === '23505') {
        setMensaje('⚠️ Este correo ya está registrado. Puedes iniciar sesión directamente.')
      } else {
        setMensaje('❌ Error: ' + error.message)
      }
    } else {
      setExito(true)
      setMensaje('✅ ¡Registro exitoso! Ya puedes iniciar sesión con tu correo.')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-2xl shadow-lg p-6 mb-4">
            <h1
              className="text-5xl font-bold tracking-tight"
              style={{ color: '#E31E24' }}
            >
              GRACIA
            </h1>
            <p className="text-gray-600 mt-2 text-sm font-medium tracking-widest uppercase">
              Iglesia Cristiana
            </p>
          </div>
          <p className="text-gray-500 text-sm">
            Registro de Maestros - Escuela Bíblica Dominical
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {exito ? (
            <div className="text-center space-y-4">
              <p className="text-green-600 font-medium">{mensaje}</p>
              <a
                href="/login"
                className="inline-block px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition"
                style={{ backgroundColor: '#E31E24' }}
              >
                Ir al inicio de sesión
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombres *
                </label>
                <input
                  type="text"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Apellidos *
                </label>
                <input
                  type="text"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Número de celular
                </label>
                <input
                  type="tel"
                  name="celular"
                  value={form.celular}
                  onChange={handleChange}
                  placeholder="Ej: 0991234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  name="fecha_nacimiento"
                  value={form.fecha_nacimiento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Comida favorita
                </label>
                <input
                  type="text"
                  name="comida_favorita"
                  value={form.comida_favorita}
                  onChange={handleChange}
                  placeholder="Ej: Encebollado, Pizza, etc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={cargando}
                className="w-full py-3 px-4 rounded-xl text-white font-semibold transition disabled:opacity-50 shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#E31E24' }}
              >
                {cargando ? 'Registrando...' : 'Registrarme como maestro'}
              </button>
            </form>
          )}

          {mensaje && !exito && (
            <p className="mt-4 text-center text-sm text-gray-700">{mensaje}</p>
          )}

          <p className="mt-6 text-xs text-center text-gray-400">
            Al registrarte podrás acceder al panel con tu correo.
          </p>
        </div>
      </div>
    </div>
  )
}
