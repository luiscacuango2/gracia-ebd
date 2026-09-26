'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function obtenerOCrearToken(semanaId: string): Promise<{
  exito: boolean
  token?: string
  mensaje: string
}> {
  const supabase = await createClient()

  // Verificar admin o principal
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('id, rol')
    .eq('correo', user?.email)
    .single()

  if (!yo) {
    return { exito: false, mensaje: 'No autenticado' }
  }

  // Buscar la semana
  const { data: semana } = await supabase
    .from('semanas')
    .select('id, token_publico')
    .eq('id', semanaId)
    .single()

  if (!semana) {
    return { exito: false, mensaje: 'Semana no encontrada' }
  }

  // Si ya tiene token, devolverlo
  if (semana.token_publico) {
    return { exito: true, token: semana.token_publico, mensaje: 'Token existente' }
  }

  // Generar nuevo token
  const nuevoToken = randomBytes(16).toString('hex')

  const { error } = await supabase
    .from('semanas')
    .update({ token_publico: nuevoToken })
    .eq('id', semanaId)

  if (error) {
    return { exito: false, mensaje: 'Error: ' + error.message }
  }

  revalidatePath('/dashboard/semanas')
  return { exito: true, token: nuevoToken, mensaje: 'Token generado' }
}

export async function regenerarToken(semanaId: string): Promise<{
  exito: boolean
  token?: string
  mensaje: string
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') {
    return { exito: false, mensaje: 'Solo administradores' }
  }

  const nuevoToken = randomBytes(16).toString('hex')

  const { error } = await supabase
    .from('semanas')
    .update({ token_publico: nuevoToken })
    .eq('id', semanaId)

  if (error) {
    return { exito: false, mensaje: 'Error: ' + error.message }
  }

  revalidatePath('/dashboard/semanas')
  return { exito: true, token: nuevoToken, mensaje: 'Token regenerado' }
}
