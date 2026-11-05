'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function guardarPuntosSemana({
  semanaId,
  puntos,
}: {
  semanaId: string
  puntos: Array<{
    nino_id: string
    asistencia: boolean
    comportamiento: boolean
    versiculo: boolean
  }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { exito: false, mensaje: 'No autenticado' }
  }

  const { data: maestro } = await supabase
    .from('maestros')
    .select('id, rol')
    .eq('correo', user.email)
    .single()

  if (!maestro) {
    return { exito: false, mensaje: 'Maestro no encontrado' }
  }

  // Verificar si es admin o el maestro principal de esa semana
  const { data: asignacion } = await supabase
    .from('asignaciones')
    .select('*')
    .eq('semana_id', semanaId)
    .maybeSingle()

  const esAdmin = maestro.rol === 'admin'
  const esPrincipal = asignacion?.maestro_principal_id === maestro.id

  if (!esAdmin && !esPrincipal) {
    return {
      exito: false,
      mensaje: 'Solo el maestro principal o el administrador pueden registrar puntos.',
    }
  }

  // Preparar datos para insertar/actualizar
  const datos = puntos.map((p: any) => ({
    nino_id: p.nino_id,
    semana_id: semanaId,
    maestro_registro_id: maestro.id,
    asistencia: p.asistencia,
    comportamiento: p.comportamiento,
    versiculo: p.versiculo,
    observacion: p.observacion || null, // 🆕 Guardar observación
    fecha_registro: new Date().toISOString(),
  }))

  // Upsert: si ya existe, lo actualiza; si no, lo inserta
  const { data, error } = await supabase
    .from('puntos_ninos')
    .upsert(datos, { onConflict: 'nino_id,semana_id' })
    .select() // 🆕 Agregamos .select() para que devuelva los datos

  // 🆕 AGREGAR ESTO PARA DIAGNOSTICAR
  console.log("🎯 Upsert error:", error)
  console.log("🎯 Upsert data:", data)

  if (error) {
    return { exito: false, mensaje: 'Error: ' + error.message }
  }

  revalidatePath('/dashboard/puntos')
  return { exito: true, mensaje: 'Puntos guardados correctamente' }
}