import { createClient } from '@/lib/supabase/server'
import PuntosPublicos from './PuntosPublicos'

export const revalidate = 0

export default async function PuntosPage() {
  const supabase = await createClient()

  // Traemos también todas las semanas (fechas) ordenadas
  const { data: semanas } = await supabase
    .from('semanas')
    .select('fecha')
    .order('fecha', { ascending: true })

  const { data: ninos } = await supabase
    .from('ninos')
    .select(`
      id, nombres, apellidos, codigo_secreto,
      puntos_ninos (
        asistencia, 
        comportamiento, 
        versiculo, 
        observacion, 
        semanas (fecha),
        maestros (nombres) 
      ),
      premios_ganados (fecha_ganado, entregado)
    `)
    .eq('activo', true)
    .order('nombres', { ascending: true })

  // Pasamos las semanas como prop
  return <PuntosPublicos ninos={ninos || []} semanas={semanas || []} />
}