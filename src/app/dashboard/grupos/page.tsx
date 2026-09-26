import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const ORDEN_GRUPOS = ['principales', 'ayudantes', 'ninos']

export default async function GruposPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  const { data: grupos } = await supabase.from('grupos').select('*')
  const { data: miembros } = await supabase
    .from('grupo_maestros')
    .select('grupo_id, maestro_id')
  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos, activo')
    .order('nombres', { ascending: true })

  const mapaMaestros = new Map((maestros ?? []).map((m) => [m.id, m]))

  const gruposOrdenados = [...(grupos ?? [])].sort((a, b) => {
    const ia = ORDEN_GRUPOS.indexOf(a.nombre)
    const ib = ORDEN_GRUPOS.indexOf(b.nombre)
    if (ia === -1 && ib === -1) return a.nombre.localeCompare(b.nombre)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Grupos de Maestros
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Asigna qué maestros pueden servir en cada rol.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {gruposOrdenados.map((grupo) => {
          const integrantes = (miembros ?? [])
            .filter((m) => m.grupo_id === grupo.id)
            .map((m) => mapaMaestros.get(m.maestro_id))
            .filter(Boolean)
            // 🆕 Ordenar alfabéticamente por nombres
            .sort((a: any, b: any) =>
              `${a.nombres} ${a.apellidos}`.localeCompare(
                `${b.nombres} ${b.apellidos}`,
                'es'
              )
            )

          const emoji =
            grupo.nombre === 'principales'
              ? '🧑‍🏫'
              : grupo.nombre === 'ayudantes'
                ? '🤝'
                : '🧒'

          return (
            <div
              key={grupo.id}
              className="bg-white rounded-lg shadow p-5 sm:p-6 border-t-4"
              style={{ borderColor: '#E31E24' }}
            >
              <h2 className="text-base sm:text-lg font-bold text-gray-800 capitalize mb-1">
                {emoji}{' '}
                {grupo.nombre === 'ninos' ? 'Niños pequeños' : grupo.nombre}
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                {grupo.descripcion}
              </p>

              <p className="text-sm text-gray-700 mb-3">
                <strong>{integrantes.length}</strong> maestro
                {integrantes.length === 1 ? '' : 's'}
              </p>

              <div className="space-y-1.5 mb-4 max-h-60 overflow-y-auto">
                {integrantes.length > 0 ? (
                  integrantes.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="text-gray-700 truncate">
                        {m.nombres} {m.apellidos}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Sin maestros asignados
                  </p>
                )}
              </div>

              <Link
                href={`/dashboard/grupos/${grupo.id}`}
                className="block text-center px-4 py-2 rounded-lg text-white text-sm font-medium"
                style={{ backgroundColor: '#E31E24' }}
              >
                Gestionar
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
