'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function entregarPremio(premioId: string, maestroId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('premios_ganados')
    .update({
      entregado: true,
      fecha_entregado: new Date().toISOString(),
      maestro_entrego_id: maestroId,
    })
    .eq('id', premioId)

  if (error) return { exito: false, mensaje: error.message }
  revalidatePath('/dashboard/premios')
  return { exito: true, mensaje: 'Premio entregado' }
}