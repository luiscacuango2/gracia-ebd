import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RotacionesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  const { data: rotaciones } = await supabase
    .from('rotaciones')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos')

  const { data: semanas } = await supabase
    .from('semanas')
    .select('id, fecha, tema')

  const mapaMaestros = new Map(
    (maestros ?? []).map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )
  const mapaSemanas = new Map(
    (semanas ?? []).map((s) => [
      s.id,
      {
        fecha: new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        }),
        tema: s.tema,
      },
    ])
  )

  const nombreGrupo = (g: string) => {
    if (g === 'principales') return '🧑‍🏫 Principal'
    if (g === 'ayudantes') return '🤝 Ayudante'
    if (g === 'ninos') return '🧒 Niños'
    return g
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Historial de cambios
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Registro de todas las rotaciones de maestros con sus motivos.
      </p>

      {rotaciones && rotaciones.length > 0 ? (
        <>
          {/* Vista TABLA (desktop) */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha cambio</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Semana</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Antes</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Después</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rotaciones.map((r) => {
                  const semana = mapaSemanas.get(r.semana_id)
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {semana ? (
                          <Link href={`/dashboard/semanas/${r.semana_id}`} className="text-red-600 hover:underline">
                            {semana.fecha} - {semana.tema}
                          </Link>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{nombreGrupo(r.grupo)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{r.maestro_anterior_id ? mapaMaestros.get(r.maestro_anterior_id) || '—' : 'Sin asignar'}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{r.maestro_nuevo_id ? mapaMaestros.get(r.maestro_nuevo_id) || '—' : 'Sin asignar'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{r.comentario || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Vista TARJETAS (móvil) */}
          <div className="lg:hidden space-y-3">
            {rotaciones.map((r) => {
              const semana = mapaSemanas.get(r.semana_id)
              return (
                <div key={r.id} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: '#E31E24' }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-800">{nombreGrupo(r.grupo)}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  {semana && (
                    <Link href={`/dashboard/semanas/${r.semana_id}`} className="text-xs text-red-600 hover:underline block mb-3 truncate">
                      📅 {semana.fecha} - {semana.tema}
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                    <div>
                      <p className="text-gray-400 uppercase font-medium mb-1">Antes</p>
                      <p className="text-gray-600 truncate">{r.maestro_anterior_id ? mapaMaestros.get(r.maestro_anterior_id) || '—' : 'Sin asignar'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase font-medium mb-1">Después</p>
                      <p className="text-gray-800 font-medium truncate">{r.maestro_nuevo_id ? mapaMaestros.get(r.maestro_nuevo_id) || '—' : 'Sin asignar'}</p>
                    </div>
                  </div>
                  {r.comentario && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-gray-400 uppercase font-medium mb-1">Motivo</p>
                      <p className="text-xs text-gray-700">{r.comentario}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Aún no hay cambios registrados.</p>
          <p className="text-sm text-gray-400 mt-2">
            Cuando un admin cambie un maestro asignado, aparecerá aquí.
          </p>
        </div>
      )}
    </div>
  )
}
