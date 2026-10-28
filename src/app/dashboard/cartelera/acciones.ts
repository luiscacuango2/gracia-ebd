'use server'

import { createClient } from '@/lib/supabase/server'

export async function obtenerHistorialNino(ninoId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('puntos_ninos')
    .select(`
      id,
      asistencia,
      comportamiento,
      versiculo,
      semanas (fecha, tema),
      maestros (nombres)
    `)
    .eq('nino_id', ninoId)
    // 🆕 Filtramos los que no tienen ninguna estrella en la base de datos
    .or('asistencia.eq.true,comportamiento.eq.true,versiculo.eq.true')

  if (error) {
    console.error("Error al cargar historial:", error)
    return { exito: false, mensaje: error.message, datos: [] }
  }

  // 🆕 Ordenamos en JavaScript por la fecha de la semana (más reciente primero)
  const datosOrdenados = (data || []).sort((a: any, b: any) => {
    const fechaA = a.semanas?.fecha || ''
    const fechaB = b.semanas?.fecha || ''
    return fechaB.localeCompare(fechaA) // Orden descendente
  })

  return { exito: true, mensaje: 'OK', datos: datosOrdenados }
}