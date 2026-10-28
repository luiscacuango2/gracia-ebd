import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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
      {/* Enlace para regresar */}
      <div className="mb-6">
        <Link
          href="/dashboard/maestros"
          className="text-red-600 dark:text-red-400 hover:underline text-sm inline-flex items-center gap-1"
        >
          ← Volver al listado de maestros
        </Link>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Editar Maestro
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">
        Actualiza los datos de {maestro.nombres} {maestro.apellidos}
      </p>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 max-w-2xl border border-gray-200 dark:border-gray-700">
        <EditarMaestroForm maestro={maestro} />
      </div>
    </div>
  )
}