import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PremiosCliente from './PremiosCliente'

export default async function PremiosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: yo } = await supabase
    .from('maestros')
    .select('id, rol')
    .eq('correo', user.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  // Traer premios con datos del niño
  const { data: premiosRaw } = await supabase
    .from('premios_ganados')
    .select(`
      id,
      estrellas_al_ganar,
      entregado,
      fecha_ganado,
      fecha_entregado,
      ninos (nombres, apellidos)
    `)
    .order('entregado', { ascending: true })
    .order('fecha_ganado', { ascending: false })

  // Normalizar la relación ninos (de arreglo a objeto único)
  const premios = (premiosRaw ?? []).map(p => ({
    ...p,
    ninos: Array.isArray(p.ninos) ? (p.ninos[0] || null) : p.ninos,
  }))

  return <PremiosCliente premios={premios} maestroId={yo.id} />
}