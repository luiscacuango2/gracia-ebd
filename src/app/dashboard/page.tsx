import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { count: totalMaestros } = await supabase
    .from('maestros')
    .select('*', { count: 'exact', head: true })

  const { count: totalSemanas } = await supabase
    .from('semanas')
    .select('*', { count: 'exact', head: true })

  const hoy = new Date().toISOString().split('T')[0]
  const { data: proximaSemana } = await supabase
    .from('semanas')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })
    .limit(1)
    .maybeSingle()

  const { data: asignacion } = proximaSemana
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

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Panel de Administración
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Bienvenido a la Escuela Bíblica Dominical
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

          {/* Info de la clase */}
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

          {/* 🆕 Actividad de niños (antes de maestros) */}
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

          {/* Maestros asignados */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs uppercase text-gray-400 font-medium mb-3">Maestros asignados</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧑‍🏫</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Principal</p>
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {nombreMaestro(asignacion?.maestro_principal_id)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Ayudante</p>
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {nombreMaestro(asignacion?.maestro_ayudante_id)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧒</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Niños</p>
                  <p className="font-medium text-gray-800 text-sm truncate">
                    {nombreMaestro(asignacion?.maestro_ninos_id)}
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
