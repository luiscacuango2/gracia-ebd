import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RotacionCliente from './cliente'

export default async function RotacionAutomaticaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  const hoy = new Date().toISOString().split('T')[0]
  const { data: semanas } = await supabase
    .from('semanas')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })

  const { data: asignaciones } = await supabase
    .from('asignaciones')
    .select('*')

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos, activo')

  const { data: grupos } = await supabase.from('grupos').select('id, nombre')
  const { data: miembros } = await supabase
    .from('grupo_maestros')
    .select('grupo_id, maestro_id')

  // TODOS los maestros en un mapa (para poder mostrar cualquier nombre)
  const todosMaestros = (maestros ?? []).map((m) => ({
    id: m.id,
    nombres: m.nombres,
    apellidos: m.apellidos,
  }))

  const mapaMaestros = new Map((maestros ?? []).map((m) => [m.id, m]))
  const mapaAsignaciones = new Map(
    (asignaciones ?? []).map((a) => [a.semana_id, a])
  )

  const filtroGrupo = (nombre: string) => {
    const grupoId = grupos?.find((g) => g.nombre === nombre)?.id
    if (!grupoId) return []
    const ids = (miembros ?? [])
      .filter((m) => m.grupo_id === grupoId)
      .map((m) => m.maestro_id)
    return ids.map((id) => mapaMaestros.get(id)).filter(Boolean)
  }

  const gruposInfo = {
    principales: filtroGrupo('principales'),
    ayudantes: filtroGrupo('ayudantes'),
    ninos: filtroGrupo('ninos'),
  }

  // Historial de uso por maestro
  const { data: historial } = await supabase
    .from('asignaciones')
    .select(`
      maestro_principal_id,
      maestro_ayudante_id,
      maestro_ninos_id,
      semanas!inner (fecha)
    `)
    .lt('semanas.fecha', hoy)

  const conteoPrincipal = new Map<string, number>()
  const conteoAyudante = new Map<string, number>()
  const conteoNinos = new Map<string, number>()

  ;(historial ?? []).forEach((h: any) => {
    if (h.maestro_principal_id)
      conteoPrincipal.set(
        h.maestro_principal_id,
        (conteoPrincipal.get(h.maestro_principal_id) || 0) + 1
      )
    if (h.maestro_ayudante_id)
      conteoAyudante.set(
        h.maestro_ayudante_id,
        (conteoAyudante.get(h.maestro_ayudante_id) || 0) + 1
      )
    if (h.maestro_ninos_id)
      conteoNinos.set(
        h.maestro_ninos_id,
        (conteoNinos.get(h.maestro_ninos_id) || 0) + 1
      )
  })

  return (
    <RotacionCliente
      semanas={(semanas ?? []).map((s) => ({
        id: s.id,
        fecha: s.fecha,
        tema: s.tema,
        pasaje_biblico: s.pasaje_biblico,
        versiculo_memorizar: s.versiculo_memorizar,
        manualidad: s.manualidad,
	actividad_ninos: s.actividad_ninos || null, //ninos
        asignacion: mapaAsignaciones.get(s.id) || null,
      }))}
      todosMaestros={todosMaestros}
      gruposInfo={{
        principales: gruposInfo.principales.map((m: any) => ({
          id: m.id,
          nombres: m.nombres,
          apellidos: m.apellidos,
          total: conteoPrincipal.get(m.id) || 0,
        })),
        ayudantes: gruposInfo.ayudantes.map((m: any) => ({
          id: m.id,
          nombres: m.nombres,
          apellidos: m.apellidos,
          total: conteoAyudante.get(m.id) || 0,
        })),
        ninos: gruposInfo.ninos.map((m: any) => ({
          id: m.id,
          nombres: m.nombres,
          apellidos: m.apellidos,
          total: conteoNinos.get(m.id) || 0,
        })),
      }}
    />
  )
}
