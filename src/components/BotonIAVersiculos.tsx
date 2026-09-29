'use client'

import { useState } from 'react'

export default function BotonIAVersiculos({
  tema,
  onSugerencia,
}: {
  tema: string
  onSugerencia: (versiculos: string) => void
}) {
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const handleGenerar = async () => {
    if (!tema || !tema.trim()) {
      setMensaje('⚠️ Primero ingresa un tema')
      return
    }

    setCargando(true)
    setMensaje('')

    try {
      const res = await fetch('/api/ia/versiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tema: tema.trim() }),
      })
      const data = await res.json()

      if (data.exito) {
        onSugerencia(data.versiculos_estudio)
        setMensaje('✅ Versículos generados. Puedes editarlos.')
      } else {
        setMensaje('❌ ' + data.mensaje)
      }
    } catch (err: any) {
      setMensaje('❌ Error: ' + err.message)
    }
    setCargando(false)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerar}
        disabled={cargando || !tema.trim()}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
        }}
      >
        {cargando ? '⏳ Generando...' : '✨ Sugerir con IA'}
      </button>
      {mensaje && <p className="text-xs mt-2 text-gray-600">{mensaje}</p>}
    </div>
  )
}
