import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditarMaestroForm from './form'

export default async function EditarMaestroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: maestro } = await supabase
    .from('maestros')
    .select('*')
    .eq('id', id)
    .single()

  if (!maestro) notFound()

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Editar Maestro
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Actualiza los datos de {maestro.nombres} {maestro.apellidos}
      </p>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl">
        <EditarMaestroForm maestro={maestro} />
      </div>
    </div>
  )
}
