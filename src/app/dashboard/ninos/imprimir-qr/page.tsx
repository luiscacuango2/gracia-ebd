import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ImprimirQR from './ImprimirQR'

export default async function ImprimirQRPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: maestro } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user.email)
    .single()

    // Permitir que cualquier maestro autenticado pueda imprimir QRs
  if (!maestro) redirect('/login')

  const { data: ninos } = await supabase
    .from('ninos')
    .select('*')
    .eq('activo', true)
    .order('nombres', { ascending: true })

  return <ImprimirQR ninos={ninos ?? []} />
}