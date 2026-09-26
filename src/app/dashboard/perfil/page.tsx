import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilForm from './form'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: maestro } = await supabase
    .from('maestros')
    .select('*')
    .eq('correo', user.email)
    .single()

  if (!maestro) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">
          No se encontró tu información de maestro. Contacta al administrador.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        Mi perfil
      </h1>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
        Actualiza tu información personal.
      </p>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 max-w-2xl">
        <PerfilForm maestro={maestro} />
      </div>
    </div>
  )
}
