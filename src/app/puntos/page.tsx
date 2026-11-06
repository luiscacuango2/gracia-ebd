import { createClient } from '@/lib/supabase/server'
import PuntosPublicos from './PuntosPublicos'

export const revalidate = 0

export default async function PuntosPage() {
  const supabase = await createClient()

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

  return <PuntosPublicos ninos={ninos || []} />
}