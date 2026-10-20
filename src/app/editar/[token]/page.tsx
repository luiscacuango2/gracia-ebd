import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormEdicionPublica from './form'

export default async function EditarPublicoPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  const { data: semana } = await supabase
    .from('semanas')
    .select('*')
    .eq('token_publico', token)
    .single()

  if (!semana) notFound()

  const { data: asignacion } = await supabase
    .from('asignaciones')
    .select('*')
    .eq('semana_id', semana.id)
    .maybeSingle()

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos')

  const mapaMaestros = new Map(
    (maestros ?? []).map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )

  const fechaFormateada = new Date(semana.fecha + 'T12:00:00').toLocaleDateString(
    'es-ES',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Logo y título */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 mb-3">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: '#E31E24' }}
            >
              GRACIA
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs font-medium tracking-widest uppercase">
              Iglesia Cristiana
            </p>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Edición de clase - Escuela Bíblica Dominical
          </p>
        </div>

        {/* Info banner con la fecha */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl p-4 mb-4">
          <p className="text-xs text-blue-800 dark:text-blue-300 font-medium mb-1">
            📅 Fecha de la clase
          </p>
          <p className="text-sm text-blue-900 dark:text-blue-200 capitalize">{fechaFormateada}</p>
        </div>

        {/* Card principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <FormEdicionPublica
            semana={semana}
            asignacion={asignacion}
            mapaMaestros={mapaMaestros}
          />
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          © {new Date().getFullYear()} Gracia Iglesia Cristiana
        </p>
      </div>
    </div>
  )
}