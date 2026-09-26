import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import FormActividadNinos from './form'

export default async function ActividadNinosPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Buscar la semana por token
  const { data: semana } = await supabase
    .from('semanas')
    .select('*')
    .eq('token_publico', token)
    .single()

  if (!semana) notFound()

  // Cargar asignación para mostrar info del maestro de niños
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo y título */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white rounded-2xl shadow-lg p-5 mb-3">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: '#E31E24' }}
            >
              GRACIA
            </h1>
            <p className="text-gray-600 mt-1 text-xs font-medium tracking-widest uppercase">
              Iglesia Cristiana
            </p>
          </div>
          <p className="text-gray-500 text-sm">
            Actividad para niños pequeños
          </p>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <p className="text-xs text-blue-800 font-medium mb-1">
            📅 Fecha de la clase
          </p>
          <p className="text-sm text-blue-900 capitalize">{fechaFormateada}</p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <FormActividadNinos
            semana={semana}
            asignacion={asignacion}
            mapaMaestros={mapaMaestros}
          />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Gracia Iglesia Cristiana
        </p>
      </div>
    </div>
  )
}
