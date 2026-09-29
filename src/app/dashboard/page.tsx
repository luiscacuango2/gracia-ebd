import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('id, rol, nombres, apellidos')
    .eq('correo', user?.email)
    .single()

  const esAdmin = yo?.rol === 'admin'
  const miId = yo?.id

  const hoy = new Date().toISOString().split('T')[0]

  // Próxima semana (compartido)
  const { data: proximaSemana } = await supabase
    .from('semanas')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: asignacionProxima } = proximaSemana
    ? await supabase
        .from('asignaciones')
        .select('*')
        .eq('semana_id', proximaSemana.id)
        .maybeSingle()
    : { data: null }

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos')

  const mapaMaestros = new Map(
    (maestros ?? []).map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )

  const nombreMaestro = (id: string | null | undefined) => {
    if (!id) return 'Sin asignar'
    return mapaMaestros.get(id) || 'Sin asignar'
  }

  // ====== VISTA ADMIN ======
  if (esAdmin) {
    const { count: totalMaestros } = await supabase
      .from('maestros')
      .select('*', { count: 'exact', head: true })

    const { count: totalSemanas } = await supabase
      .from('semanas')
      .select('*', { count: 'exact', head: true })

    return (
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Panel de Administración
        </h1>
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Bienvenido, {yo?.nombres}
        </p>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-5 sm:p-6 border-l-4" style={{ borderColor: '#E31E24' }}>
            <p className="text-sm text-gray-500">Maestros registrados</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalMaestros ?? 0}</p>
            <Link href="/dashboard/maestros" className="text-xs text-red-600 hover:underline mt-2 inline-block">
              Ver maestros →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-5 sm:p-6 border-l-4" style={{ borderColor: '#E31E24' }}>
            <p className="text-sm text-gray-500">Semanas programadas</p>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalSemanas ?? 0}</p>
            <Link href="/dashboard/semanas" className="text-xs text-red-600 hover:underline mt-2 inline-block">
              Ver semanas →
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-5 sm:p-6 border-l-4" style={{ borderColor: '#E31E24' }}>
            <p className="text-sm text-gray-500">Próxima clase</p>
            <p className="text-lg font-bold text-gray-800 mt-2">
              {proximaSemana
                ? new Date(proximaSemana.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                : 'Sin programar'}
            </p>
            {proximaSemana && (
              <Link href={`/dashboard/semanas/${proximaSemana.id}`} className="text-xs text-red-600 hover:underline mt-2 inline-block">
                Editar clase →
              </Link>
            )}
          </div>
        </div>

        {/* Detalle próxima clase */}
        {proximaSemana ? (
          <div className="bg-white rounded-lg shadow p-5 sm:p-6 border-l-4 mb-8" style={{ borderColor: '#E31E24' }}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase text-gray-500 font-medium">📅 Próxima clase</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {new Date(proximaSemana.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 break-words">
                  {proximaSemana.tema}
                </h2>
              </div>
              <Link
                href={`/dashboard/semanas/${proximaSemana.id}`}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 text-center flex-shrink-0"
                style={{ backgroundColor: '#E31E24' }}
              >
                Editar
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium mb-1">Versículos de estudio</p>
                <p className="text-gray-700 text-sm">{proximaSemana.pasaje_biblico || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium mb-1">Versículo para memorizar</p>
                <p className="text-gray-700 text-sm">{proximaSemana.versiculo_memorizar || '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-400 font-medium mb-1">Manualidad</p>
                <p className="text-gray-700 text-sm">{proximaSemana.manualidad || '—'}</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-xs uppercase text-yellow-700 font-medium mb-1">
                🧒 Actividad para niños pequeños
              </p>
              <p className="text-gray-700 text-sm">
                {proximaSemana.actividad_ninos || (
                  <span className="text-gray-400 italic text-xs">Sin registrar</span>
                )}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs uppercase text-gray-400 font-medium mb-3">Maestros asignados</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧑‍🏫</span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Principal</p>
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {nombreMaestro(asignacionProxima?.maestro_principal_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤝</span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Ayudante</p>
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {nombreMaestro(asignacionProxima?.maestro_ayudante_id)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🧒</span>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Niños</p>
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {nombreMaestro(asignacionProxima?.maestro_ninos_id)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <p className="text-gray-500 mb-4">No hay clases programadas próximamente.</p>
            <Link
              href="/dashboard/semanas/nueva"
              className="inline-block px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#E31E24' }}
            >
              Programar próxima clase
            </Link>
          </div>
        )}
      </div>
    )
  }

  // ====== VISTA MAESTRO ======
  // El maestro ve sus próximas clases asignadas
  const { data: misAsignaciones } = await supabase
    .from('asignaciones')
    .select(`
      id,
      semana_id,
      maestro_principal_id,
      maestro_ayudante_id,
      maestro_ninos_id,
      semanas!inner (id, fecha, tema, pasaje_biblico, versiculo_memorizar, manualidad, actividad_ninos)
    `)
    .or(
      `maestro_principal_id.eq.${miId},maestro_ayudante_id.eq.${miId},maestro_ninos_id.eq.${miId}`
    )

  // Filtrar las futuras
  const misClasesFuturas = (misAsignaciones ?? [])
    .map((a: any) => {
      const s = a.semanas
      if (!s) return null
      if (s.fecha < hoy) return null
      return {
        semanaId: s.id,
        fecha: s.fecha,
        tema: s.tema,
        rol:
          a.maestro_principal_id === miId
            ? 'Principal'
            : a.maestro_ayudante_id === miId
              ? 'Ayudante'
              : 'Niños',
        pasaje_biblico: s.pasaje_biblico,
        versiculo_memorizar: s.versiculo_memorizar,
	actividad_ninos: s.actividad_ninos, // ninos actividad
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.fecha.localeCompare(b.fecha))

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Hola, {yo?.nombres}
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Bienvenido a la Escuela Bíblica Dominical
      </p>

      {/* Próxima clase general */}
      {proximaSemana && (
        <div className="bg-white rounded-lg shadow p-5 sm:p-6 border-l-4 mb-8" style={{ borderColor: '#E31E24' }}>
          <p className="text-xs uppercase text-gray-500 font-medium mb-1">📅 Próxima clase</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-2">
            {new Date(proximaSemana.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
            {proximaSemana.tema}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧑‍🏫</span>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Principal</p>
                <p className="font-medium text-gray-800 text-sm truncate">
                  {nombreMaestro(asignacionProxima?.maestro_principal_id)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Ayudante</p>
                <p className="font-medium text-gray-800 text-sm truncate">
                  {nombreMaestro(asignacionProxima?.maestro_ayudante_id)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧒</span>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Niños</p>
                <p className="font-medium text-gray-800 text-sm truncate">
                  {nombreMaestro(asignacionProxima?.maestro_ninos_id)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Mis próximas clases asignadas */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          📖 Mis próximas clases ({misClasesFuturas.length})
        </h2>

        {misClasesFuturas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-2">
              Aún no tienes clases asignadas.
            </p>
            <p className="text-xs text-gray-400">
              El administrador te asignará próximamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
{misClasesFuturas.map((clase: any) => (
  <Link
    key={clase.semanaId}
    href={`/dashboard/semanas/${clase.semanaId}`}
    className="block bg-white rounded-lg shadow p-4 border-l-4 hover:shadow-md transition"
    style={{ borderColor: '#E31E24' }}
  >
    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase text-gray-500 font-medium">
          {new Date(clase.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <h3 className="text-lg font-bold text-gray-800 mt-1 break-words">
          {clase.tema}
        </h3>
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 whitespace-nowrap">
        {clase.rol === 'Principal' && '🧑‍🏫 '}
        {clase.rol === 'Ayudante' && '🤝 '}
        {clase.rol === 'Niños' && '🧒 '}
        {clase.rol}
      </span>
    </div>

    {/* Versículos */}
    {clase.pasaje_biblico && (
      <p className="text-xs text-gray-600 mb-3">
        <strong>Versículos de estudio:</strong> {clase.pasaje_biblico}
      </p>
    )}

    {/* 🆕 Actividad de niños */}
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
      <p className="text-xs uppercase text-yellow-700 font-medium mb-0.5">
        🧒 Actividad para niños pequeños
      </p>
      <p className="text-xs text-gray-700">
        {clase.actividad_ninos || (
          <span className="text-gray-400 italic">Sin registrar</span>
        )}
      </p>
    </div>
  </Link>
))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-blue-800">
          💡 Como maestro, puedes ver tu información en{' '}
          <Link href="/dashboard/perfil" className="font-medium underline">
            Mi perfil
          </Link>
          . Si necesitas cambios en tus clases, contacta al administrador.
        </p>
      </div>
    </div>
  )
}
