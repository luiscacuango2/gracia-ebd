'use client'

import { useEffect, useState } from 'react'

export default function BotonInstalarPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [mostrar, setMostrar] = useState(false)
  const [instalada, setInstalada] = useState(false)

  useEffect(() => {
    // Si ya está instalada como app, no mostrar
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalada(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setMostrar(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstalar = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setMostrar(false)
      setInstalada(true)
    }
    setDeferredPrompt(null)
  }

  const handleCerrar = () => {
    setMostrar(false)
  }

  if (!mostrar || instalada) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="bg-red-600 text-white p-3 rounded-2xl shadow-2xl flex items-center gap-3">
        <span className="text-2xl shrink-0">📲</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Instala Gracia Niños</p>
          <p className="text-xs opacity-90 leading-tight">Accede más rápido desde tu celular</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={handleInstalar}
            className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-100 transition"
          >
            Instalar
          </button>
          <button
            onClick={handleCerrar}
            className="text-white/80 hover:text-white px-2 text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}