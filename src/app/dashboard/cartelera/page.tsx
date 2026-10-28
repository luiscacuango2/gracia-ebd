import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CarteleraCliente from './CarteleraCliente'

export default async function CarteleraPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Traemos todos los niños del ranking
  const { data: ranking } = await supabase
    .from('ranking_ninos')
    .select('*')
    .order('total_estrellas', { ascending: false })

  return <CarteleraCliente rankingInicial={ranking ?? []} />
}