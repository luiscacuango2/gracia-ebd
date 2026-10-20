'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [esOscuro, setEsOscuro] = useState(false)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
    // Verificar si hay un tema guardado
    const temaGuardado = localStorage.getItem('theme')
    if (temaGuardado === 'dark') {
      setEsOscuro(true)
      document.documentElement.classList.add('dark')
    } else if (temaGuardado === 'light') {
      setEsOscuro(false)
      document.documentElement.classList.remove('dark')
    } else {
      // Usar preferencia del sistema
      const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches
      setEsOscuro(prefiereOscuro)
      if (prefiereOscuro) {
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const toggleTema = () => {
    const nuevoEsOscuro = !esOscuro
    setEsOscuro(nuevoEsOscuro)

    if (nuevoEsOscuro) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // Evitar parpadeo en el primer renderizado
  if (!montado) return null

  return (
    <button
      onClick={toggleTema}
      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors shrink-0"
      aria-label="Cambiar tema"
      title={esOscuro ? 'Modo claro' : 'Modo oscuro'}
    >
      {esOscuro ? '☀️' : '🌙'}
    </button>
  )
}