import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import SemanaForm from '../form'

export default async function EditarSemanaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('id, rol, nombres, apellidos')
    .eq('correo', user?.email)
    .single()

  if (!yo) redirect('/login')

  const { data: semana } = await supabase
    .from('semanas')
    .select('*')
    .eq('id', id)
    .single()

  if (!semana) notFound()

  const { data: asignacion } = await supabase
    .from('asignaciones')
    .select('*')
    .eq('semana_id', id)
    .maybeSingle()

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos')

  const mapaMaestros = new Map(
    (maestros ?? []).map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )

  const esAdmin = yo.rol === 'admin'
  const esPrincipal = asignacion?.maestro_principal_id === yo.id

  // 🆕 Verificar si la semana es futura (no dictada aún)
  const hoy = new Date().toISOString().split('T')[0]
  const esFutura = semana.fecha >= hoy

  // 🆕 Regla de permisos:
  // - Admin: puede editar siempre
  // - Maestro principal: solo puede editar si la clase es FUTURA
  const puedeEditar = esAdmin || (esPrincipal && esFutura)

  // Determinar por qué no puede editar (para mensaje)
  const razonNoEditar = !puedeEditar
    ? esPrincipal && !esFutura
      ? 'Esta clase ya fue dictada. Solo el administrador puede modificar clases pasadas.'
      : !esPrincipal
        ? 'Solo el maestro principal de esta semana puede editar los datos.'
        : ''
    : ''

  // ===== VISTA DE SOLO LECTURA =====
  if (!puedeEditar) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/dashboard/semanas"
            className="text-red-600 hover:underline text-sm"
          >
            ← Volver a semanas
          </Link>
        </div>

        {/* Banner informativo */}
        <div
          className={`rounded-lg p-4 mb-6 border ${
            esPrincipal && !esFutura
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-blue-50 border-blue-200'
          }`}
        >
          <p
            className={`text-sm ${
              esPrincipal && !esFutura
                ? 'text-yellow-800'
                : 'text-blue-800'
            }`}
          >
            {esPrincipal && !esFutura
              ? '📜 '
              : 'ℹ️ '}
            {razonNoEditar}
          </p>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
              {semana.tema}
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date(semana.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-medium ${
                esFutura
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {esFutura ? '📅 Clase futura' : '✅ Clase dictada'}
            </span>
            {esPrincipal && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 text-red-800">
                🧑‍🏫 Eres el principal
              </span>
            )}
          </div>
        </div>

        {/* Datos de la clase */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-4 max-w-3xl">
          <div>
            <p className="text-xs uppercase text-gray-400 font-medium mb-1">
              Versículos de estudio
            </p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {semana.pasaje_biblico || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-medium mb-1">
              Versículo para memorizar
            </p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {semana.versiculo_memorizar || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 font-medium mb-1">
              Manualidad
            </p>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">
              {semana.manualidad || '—'}
            </p>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs uppercase text-gray-400 font-medium mb-3">
              Maestros asignados
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span>🧑‍🏫</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Principal</p>
                  <p className="font-medium text-gray-800 truncate">
                    {asignacion?.maestro_principal_id
                      ? mapaMaestros.get(asignacion.maestro_principal_id) || '—'
                      : 'Sin asignar'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🤝</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Ayudante</p>
                  <p className="font-medium text-gray-800 truncate">
                    {asignacion?.maestro_ayudante_id
                      ? mapaMaestros.get(asignacion.maestro_ayudante_id) || '—'
                      : 'Sin asignar'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🧒</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Niños</p>
                  <p className="font-medium text-gray-800 truncate">
                    {asignacion?.maestro_ninos_id
                      ? mapaMaestros.get(asignacion.maestro_ninos_id) || '—'
                      : 'Sin asignar'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== VISTA DE EDICIÓN =====
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard/semanas"
          className="text-red-600 hover:underline text-sm"
        >
          ← Volver a semanas
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Editar Semana
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        {esAdmin
          ? 'Como admin puedes editar los datos de la clase.'
          : 'Como maestro principal de esta semana, puedes editar los datos de la clase.'}
      </p>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-3xl">
        <SemanaForm semana={semana} />
      </div>

      {esAdmin && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-3xl">
          <p className="text-sm text-gray-600">
            💡 Para asignar maestros a esta semana, ve al listado y usa el botón{' '}
            <strong>"👥 Asignar maestros"</strong> o{' '}
            <strong>"✏️ Modificar maestros"</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
