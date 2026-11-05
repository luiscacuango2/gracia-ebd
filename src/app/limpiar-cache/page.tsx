'use client'

import { useEffect, useState } from 'react'

export default function LimpiarCache() {
  const [estado, setEstado] = useState('Limpiando...')

  useEffect(() => {
    async function limpiar() {
      try {
        // 1. Desregistrar todos los Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          for (const registration of registrations) {
            await registration.unregister()
          }
        }

        // 2. Borrar todas las cachés del navegador
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName)
          }
        }

        setEstado('✅ ¡Caché limpiada con éxito! Ya puedes cerrar esta pestaña y abrir la app nuevamente.')
      } catch (error) {
        setEstado('❌ Error al limpiar. Intenta cerrar la pestaña y abrirla de nuevo.')
      }
    }
    limpiar()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold mb-4">Herramienta de Limpieza</h1>
        <p className="text-lg text-gray-700">{estado}</p>
      </div>
    </div>
  )
}