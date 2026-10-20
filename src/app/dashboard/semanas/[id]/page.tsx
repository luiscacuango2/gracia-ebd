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
  const esNinos = asignacion?.maestro_ninos_id === yo.id
  const esAyudante = asignacion?.maestro_ayudante_id === yo.id

  const hoy = new Date().toISOString().split('T')[0]
  const esFutura = semana.fecha >= hoy

  const puedeEditar = esAdmin || (esPrincipal && esFutura)

  const razonNoEditar = !puedeEditar
    ? esPrincipal && !esFutura
      ? 'Esta clase ya fue dictada. Solo el administrador puede modificar clases pasadas.'
      : esNinos
        ? 'Como maestro de niños puedes registrar la actividad desde tu enlace.'
        : esAyudante
          ? 'Como ayudante puedes ver la información de la clase.'
          : 'Solo el maestro principal de esta semana puede editar los datos.'
    : ''

  // ===== VISTA DE SOLO LECTURA =====
  if (!puedeEditar) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/dashboard/semanas"
            className="text-red-600 dark:text-red-400 hover:underline text-sm"
          >
            ← Volver a semanas
          </Link>
        </div>

        <div
          className={`rounded-lg p-4 mb-6 border ${
            esPrincipal && !esFutura
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
          }`}
        >
          <p
            className={`text-sm ${
              esPrincipal && !esFutura
                ? 'text-yellow-800 dark:text-yellow-300'
                : 'text-blue-800 dark:text-blue-300'
            }`}
          >
            {esPrincipal && !esFutura ? '📜 ' : 'ℹ️ '}
            {razonNoEditar}
          </p>
        </div>

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 break-words">
              {semana.tema}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
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
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {esFutura ? '📅 Clase futura' : '✅ Clase dictada'}
            </span>
            {esPrincipal && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                🧑‍🏫 Eres principal
              </span>
            )}
            {esAyudante && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                🤝 Eres ayudante
              </span>
            )}
            {esNinos && (
              <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                🧒 Maestro de niños
              </span>
            )}
          </div>
        </div>

        {/* Datos de la clase */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 space-y-4 max-w-3xl">
          <div>
            <p className="text-xs uppercase text-gray-400 dark:text-gray-500 font-medium mb-1">
              Versículos de estudio
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {semana.pasaje_biblico || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 dark:text-gray-500 font-medium mb-1">
              Versículo para memorizar
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {semana.versiculo_memorizar || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-400 dark:text-gray-500 font-medium mb-1">
              Manualidad
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {semana.manualidad || '—'}
            </p>
          </div>

          {/* Actividad para niños pequeños (SOLO LECTURA) */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <p className="text-xs uppercase text-yellow-700 dark:text-yellow-400 font-medium mb-1">
              🧒 Actividad para niños pequeños
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
              {semana.actividad_ninos || (
                <span className="text-gray-400 italic">Sin registrar</span>
              )}
            </p>
          </div>

          <div className="pt-4 border-t dark:border-gray-700">
            <p className="text-xs uppercase text-gray-400 dark:text-gray-500 font-medium mb-3">
              Maestros asignados
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span>🧑‍🏫</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Principal</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {asignacion?.maestro_principal_id
                      ? mapaMaestros.get(asignacion.maestro_principal_id) || '—'
                      : 'Sin asignar'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🤝</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Ayudante</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {asignacion?.maestro_ayudante_id
                      ? mapaMaestros.get(asignacion.maestro_ayudante_id) || '—'
                      : 'Sin asignar'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span>🧒</span>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Niños</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
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
          className="text-red-600 dark:text-red-400 hover:underline text-sm"
        >
          ← Volver a semanas
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Editar Semana
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
        {esAdmin
          ? 'Como admin puedes editar los datos de la clase.'
          : 'Como maestro principal de esta semana, puedes editar los datos de la clase.'}
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 max-w-3xl">
        <SemanaForm semana={semana} />
      </div>
    </div>
  )
}