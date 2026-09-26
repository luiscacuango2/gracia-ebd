import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import GestionGrupo from './form'

export default async function GrupoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  const { data: grupo } = await supabase
    .from('grupos')
    .select('*')
    .eq('id', id)
    .single()

  if (!grupo) notFound()

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos, activo')
    .eq('activo', true)
    .order('nombres', { ascending: true })

  const { data: miembros } = await supabase
    .from('grupo_maestros')
    .select('maestro_id')
    .eq('grupo_id', id)

  const idsAsignados = (miembros ?? []).map((m) => m.maestro_id)

  const emoji =
    grupo.nombre === 'principales'
      ? '🧑‍🏫'
      : grupo.nombre === 'ayudantes'
        ? '🤝'
        : '🧒'

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 capitalize">
        {emoji}{' '}
        {grupo.nombre === 'ninos' ? 'Niños pequeños' : grupo.nombre}
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        {grupo.descripcion}
      </p>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl">
        <GestionGrupo
          grupoId={grupo.id}
          maestros={maestros ?? []}
          idsAsignados={idsAsignados}
        />
      </div>
    </div>
  )
}
