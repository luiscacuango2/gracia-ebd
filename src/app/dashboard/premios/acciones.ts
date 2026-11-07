'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function entregarPremio(premioId: string, maestroId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('premios_ganados')
    .update({
      entregado: true,
      fecha_entregado: new Date().toISOString(), // Solo actualizamos esta fecha
      maestro_entrego_id: maestroId,
    })
    .eq('id', premioId)

  if (error) return { exito: false, mensaje: error.message }

  revalidatePath('/dashboard/premios')
  revalidatePath('/puntos')
  return { exito: true, mensaje: 'Premio entregado' }
}

export async function deshacerEntrega(premioId: string) {
  const supabase = await createClient()

  // En lugar de borrar, actualizamos los campos para volver a "Pendiente"
  const { error } = await supabase
    .from('premios_ganados')
    .update({
      entregado: false,
      fecha_entregado: null, // Borramos la fecha de entrega
      // No tocamos fecha_ganado, así se mantiene la fecha original
    })
    .eq('id', premioId)

  if (error) return { exito: false, mensaje: error.message }
  
  revalidatePath('/dashboard/premios')
  revalidatePath('/puntos')
  return { exito: true, mensaje: 'Entrega deshecha. El premio vuelve a estar pendiente.' }
}