import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RestriccionesCliente from './cliente'

export default async function RestriccionesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos, activo')
    .eq('activo', true)
    .order('nombres')

  const { data: restricciones } = await supabase
    .from('restricciones_maestros')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: ausencias } = await supabase
    .from('ausencias_maestros')
    .select('*')
    .order('fecha_desde', { ascending: true })

  return (
    <RestriccionesCliente
      maestros={maestros ?? []}
      restricciones={restricciones ?? []}
      ausencias={ausencias ?? []}
    />
  )
}
