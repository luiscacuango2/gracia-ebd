'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function anularAsignaciones({
  fechaDesde,
  fechaHasta,
  quitarPrincipal,
  quitarAyudante,
  quitarNinos,
}: {
  fechaDesde: string
  fechaHasta: string
  quitarPrincipal: boolean
  quitarAyudante: boolean
  quitarNinos: boolean
}): Promise<{
  exito: boolean
  mensaje: string
  semanasAfectadas: number
}> {
  const supabase = await createClient()

  // Verificar admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') {
    return { exito: false, mensaje: 'Solo administradores', semanasAfectadas: 0 }
  }

  // Validar que al menos un rol esté marcado
  if (!quitarPrincipal && !quitarAyudante && !quitarNinos) {
    return {
      exito: false,
      mensaje: 'Debes seleccionar al menos un rol para quitar',
      semanasAfectadas: 0,
    }
  }

  // Validar fechas
  if (!fechaDesde || !fechaHasta) {
    return {
      exito: false,
      mensaje: 'Debes indicar un rango de fechas',
      semanasAfectadas: 0,
    }
  }

  if (fechaDesde > fechaHasta) {
    return {
      exito: false,
      mensaje: 'La fecha "desde" no puede ser mayor que "hasta"',
      semanasAfectadas: 0,
    }
  }

  // Obtener semanas en el rango
  const { data: semanas } = await supabase
    .from('semanas')
    .select('id, fecha, tema')
    .gte('fecha', fechaDesde)
    .lte('fecha', fechaHasta)
    .order('fecha', { ascending: true })

  if (!semanas || semanas.length === 0) {
    return {
      exito: false,
      mensaje: 'No hay semanas en el rango de fechas indicado',
      semanasAfectadas: 0,
    }
  }

  const idsSemanas = semanas.map((s) => s.id)

  // Actualizar asignaciones (sin registrar en historial)
  const updates: any = {}
  if (quitarPrincipal) updates.maestro_principal_id = null
  if (quitarAyudante) updates.maestro_ayudante_id = null
  if (quitarNinos) updates.maestro_ninos_id = null

  const { error } = await supabase
    .from('asignaciones')
    .update(updates)
    .in('semana_id', idsSemanas)

  if (error) {
    return {
      exito: false,
      mensaje: 'Error: ' + error.message,
      semanasAfectadas: 0,
    }
  }

  // ⚠️ NOTA: NO se registran rotaciones en el historial
  // para anulaciones en bloque (por decisión del admin)

  revalidatePath('/dashboard/semanas')
  revalidatePath('/dashboard/rotaciones')

  return {
    exito: true,
    mensaje: `Se anularon asignaciones en ${semanas.length} semana${semanas.length === 1 ? '' : 's'} sin afectar el historial`,
    semanasAfectadas: semanas.length,
  }
}
