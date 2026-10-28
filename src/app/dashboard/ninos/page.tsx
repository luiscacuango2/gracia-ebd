import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ListaNinos from './ListaNinos'

export default async function NinosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: maestro } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user.email)
    .single()

  if (maestro?.rol !== 'admin') redirect('/dashboard')

  const { data: ninos } = await supabase
    .from('ninos')
    .select('*')
    .order('nombres', { ascending: true })

  return <ListaNinos ninosIniciales={ninos ?? []} />
}