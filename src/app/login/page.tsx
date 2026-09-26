'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMensaje('Error: ' + error.message)
    } else {
      setMensaje('✅ Revisa tu correo. Te enviamos un enlace de acceso.')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
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
            Escuela Bíblica Dominical
          </p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">
            Inicia sesión con tu correo
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#E31E24' }}
            >
              {cargando ? 'Enviando...' : 'Enviar enlace de acceso'}
            </button>
          </form>

          {mensaje && (
            <div
              className={`mt-5 p-3 rounded-xl text-sm text-center ${
                mensaje.startsWith('✅')
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {mensaje}
            </div>
          )}

          <p className="mt-6 text-xs text-center text-gray-400 leading-relaxed">
            Solo maestros registrados pueden acceder.
            <br />
            Te enviaremos un enlace seguro a tu correo.
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Gracia Iglesia Cristiana
        </p>
      </div>
    </div>
  )
}
