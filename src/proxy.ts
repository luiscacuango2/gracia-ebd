import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 🆕 Rutas exclusivas para admins
// (Reportes NO está aquí porque los maestros también pueden verlo)
const RUTAS_ADMIN = [
  '/dashboard/maestros',
  '/dashboard/grupos',
  '/dashboard/restricciones',
  '/dashboard/rotacion-automatica',
  '/dashboard/rotaciones',
  '/dashboard/ninos',
  '/dashboard/premios',
]

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Si no hay usuario y quiere entrar al dashboard, redirigir a login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay usuario y está en login, redirigir al dashboard
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 🆕 Verificar permisos de admin en rutas exclusivas
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const esRutaAdmin = RUTAS_ADMIN.some((ruta) =>
      request.nextUrl.pathname.startsWith(ruta)
    )

    // 🆕 EXCEPCIÓN: La impresión de QRs es accesible para todos los maestros
    const esImprimirQR = request.nextUrl.pathname.startsWith('/dashboard/ninos/imprimir-qr')

    if (esRutaAdmin && !esImprimirQR) {
      const { data: maestro } = await supabase
        .from('maestros')
        .select('rol')
        .eq('correo', user.email)
        .single()

      if (maestro?.rol !== 'admin') {
        // Redirigir al dashboard principal
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  // Añadimos '/puntos' y sus subrutas para que sean accesibles
  matcher: ['/dashboard/:path*', '/login', '/puntos/:path*', '/puntos'],
}