'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [colapsado, setColapsado] = useState(false)
  const [esMovil, setEsMovil] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [maestro, setMaestro] = useState<{
    nombres: string
    apellidos: string
    correo: string
    rol: string
  } | null>(null)

  // Detectar móvil
  useEffect(() => {
    const checkSize = () => {
      const movil = window.innerWidth < 1024
      setEsMovil(movil)
      if (movil) setColapsado(true)
      else setColapsado(false)
    }
    checkSize()
    window.addEventListener('resize', checkSize)
    return () => window.removeEventListener('resize', checkSize)
  }, [])

  // Cargar datos del usuario
  useEffect(() => {
    const cargar = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('maestros')
        .select('nombres, apellidos, correo, rol')
        .eq('correo', user.email)
        .single()
      if (data) setMaestro(data)
      setCargando(false)
    }
    cargar()
  }, [router])

  const esAdmin = maestro?.rol === 'admin'

  const links = [
    { href: '/dashboard', label: 'Inicio', icon: '📊', exact: true },
    { href: '/dashboard/semanas', label: 'Semanas', icon: '📅' },
    { href: '/dashboard/reportes', label: 'Reportes', icon: '📊' },
  ]

const adminLinks = [
  { href: '/dashboard/maestros', label: 'Maestros', icon: '🧑‍' },
  { href: '/dashboard/grupos', label: 'Grupos de maestros', icon: '👥' },
  { href: '/dashboard/restricciones', label: 'Restricciones y ausencias', icon: '🚫' },
  { href: '/dashboard/rotacion-automatica', label: 'Rotación automática', icon: '🎲' },
  { href: '/dashboard/rotaciones', label: 'Historial de cambios', icon: '🔄' },
]
  const esActivo = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  // Ancho del menú: colapsado = 5rem (80px), expandido = 16rem (256px)
  const anchoMenu = colapsado ? '5rem' : '16rem'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Overlay para móvil cuando el menú está expandido */}
      {esMovil && !colapsado && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setColapsado(true)}
        />
      )}

      {/* Menú lateral */}
      <aside
        style={{
          width: anchoMenu,
          left: 0,
          top: 0,
        }}
        className={`bg-white shadow-lg flex flex-col transition-all duration-300 ease-in-out z-40 ${
          esMovil ? 'fixed h-full' : 'fixed h-full'
        }`}
      >
        {/* Header del menú */}
        <div className="p-4 border-b flex items-center justify-center min-h-[73px]">
          {!colapsado ? (
            <div className="w-full">
              <h1
                className="text-2xl font-bold"
                style={{ color: '#E31E24' }}
              >
                GRACIA
              </h1>
              <p className="text-xs text-gray-500 mt-1">Escuela Bíblica</p>
            </div>
          ) : (
            <div
              className="text-2xl font-bold"
              style={{ color: '#E31E24' }}
            >
              G
            </div>
          )}
        </div>

        {/* Botón hamburguesa */}
        <button
          onClick={() => setColapsado(!colapsado)}
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-gray-50 z-50"
          aria-label={colapsado ? 'Expandir menú' : 'Colapsar menú'}
        >
          <span className="text-xs text-gray-600">
            {colapsado ? '▶' : '◀'}
          </span>
        </button>

        {/* Navegación */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => esMovil && setColapsado(true)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                esActivo(link.href, link.exact)
                  ? 'bg-red-50 text-red-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={colapsado ? link.label : undefined}
            >
              <span className="text-xl flex-shrink-0">{link.icon}</span>
              {!colapsado && (
                <span className="text-sm truncate">{link.label}</span>
              )}
            </Link>
          ))}

          {esAdmin && (
            <>
              {!colapsado && (
                <div className="pt-4 pb-2 px-3">
                  <p className="text-xs uppercase text-gray-400 font-medium">
                    Administración
                  </p>
                </div>
              )}
              {colapsado && <div className="border-t my-3" />}

              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => esMovil && setColapsado(true)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition ${
                    esActivo(link.href)
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={colapsado ? link.label : undefined}
                >
                  <span className="text-xl flex-shrink-0">{link.icon}</span>
                  {!colapsado && (
                    <span className="text-sm truncate">{link.label}</span>
                  )}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Footer del menú */}
        <div className="p-3 border-t bg-white">
          {!colapsado ? (
            <>
	<Link
	  href="/dashboard/perfil"
	  className="block text-xs text-gray-500 truncate font-medium hover:text-red-600"
	>
	  {maestro ? `${maestro.nombres} ${maestro.apellidos}` : 'Usuario'}
	</Link>
	<p className="text-xs text-gray-400 truncate">{maestro?.correo}</p>
              {esAdmin && (
                <span className="inline-block mt-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
              <button
                onClick={handleLogout}
                className="mt-2 text-sm text-red-600 hover:underline block"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center text-xl hover:bg-gray-100 rounded-lg py-2"
              title="Cerrar sesión"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Contenido principal - se desplaza según el menú */}
<main
  style={{ marginLeft: anchoMenu }}
  className="min-h-screen transition-all duration-300 ease-in-out"
>
  <div className="p-4 md:p-8">{children}</div>
</main>
    </div>
  )
}
