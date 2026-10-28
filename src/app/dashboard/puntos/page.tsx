import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PuntosCliente from './cliente'

export default async function PuntosPage({
  searchParams,
}: {
  searchParams: Promise<{ semana?: string }>
}) {
  const supabase = await createClient()
  const { semana: semanaId } = await searchParams

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: yo } = await supabase
    .from('maestros')
    .select('id, rol')
    .eq('correo', user.email)
    .single()

  if (!yo) redirect('/login')

  const esAdmin = yo.rol === 'admin'

  // Cargar todas las semanas
  const { data: semanas } = await supabase
    .from('semanas')
    .select('id, fecha, tema')
    .order('fecha', { ascending: false })

  // Lógica para seleccionar la semana actual o la más cercana
  let semanaSeleccionada = semanaId

  if (!semanaSeleccionada && semanas && semanas.length > 0) {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0) // Normalizar la hora

    // Buscamos la primera semana cuya fecha sea mayor o igual a hoy
    // (Como las semanas vienen ordenadas de más reciente a más antigua,
    // las recorremos de atrás hacia adelante para encontrar la más cercana futura)
    const semanasOrdenadas = [...semanas].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    )

    const proximaSemana = semanasOrdenadas.find(
      (s) => new Date(s.fecha + 'T12:00:00').getTime() >= hoy.getTime()
    )

    // Si hay una semana futura (o de hoy), la usamos.
    // Si no, usamos la más reciente (última que pasó).
    semanaSeleccionada = proximaSemana?.id || semanasOrdenadas[semanasOrdenadas.length - 1]?.id
  }

  // Cargar niños activos
  const { data: ninos } = await supabase
    .from('ninos')
    .select('*')
    .eq('activo', true)
    .order('nombres', { ascending: true })

  // Cargar puntos de la semana seleccionada
  let puntosSemana: any[] = []
  if (semanaSeleccionada) {
    const { data } = await supabase
      .from('puntos_ninos')
      .select('*')
      .eq('semana_id', semanaSeleccionada)
    puntosSemana = data ?? []
  }

  // Verificar si puede editar la semana seleccionada
  let puedeEditar = esAdmin
  if (!esAdmin && semanaSeleccionada) {
    const { data: asignacion } = await supabase
      .from('asignaciones')
      .select('*')
      .eq('semana_id', semanaSeleccionada)
      .maybeSingle()
    puedeEditar = asignacion?.maestro_principal_id === yo.id
  }

  return (
    <PuntosCliente
      semanas={semanas ?? []}
      ninos={ninos ?? []}
      puntosSemana={puntosSemana}
      semanaSeleccionada={semanaSeleccionada ?? ''}
      esAdmin={esAdmin}
      puedeEditar={puedeEditar}
    />
  )
}
