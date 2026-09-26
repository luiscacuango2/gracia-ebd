import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportesCliente from './cliente'

export default async function ReportesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') redirect('/dashboard')

  const { data: semanas } = await supabase
    .from('semanas')
    .select('*')
    .order('fecha', { ascending: false })

  const { data: asignaciones } = await supabase
    .from('asignaciones')
    .select('*')

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos')

  const { data: grupos } = await supabase.from('grupos').select('id, nombre')
  const { data: miembros } = await supabase
    .from('grupo_maestros')
    .select('grupo_id, maestro_id')

  const mapaMaestros = new Map(
    (maestros ?? []).map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )
  const mapaAsignaciones = new Map(
    (asignaciones ?? []).map((a) => [a.semana_id, a])
  )

  const conteoPrincipal = new Map<string, number>()
  const conteoAyudante = new Map<string, number>()
  const conteoNinos = new Map<string, number>()

  ;(asignaciones ?? []).forEach((a) => {
    if (a.maestro_principal_id)
      conteoPrincipal.set(
        a.maestro_principal_id,
        (conteoPrincipal.get(a.maestro_principal_id) || 0) + 1
      )
    if (a.maestro_ayudante_id)
      conteoAyudante.set(
        a.maestro_ayudante_id,
        (conteoAyudante.get(a.maestro_ayudante_id) || 0) + 1
      )
    if (a.maestro_ninos_id)
      conteoNinos.set(
        a.maestro_ninos_id,
        (conteoNinos.get(a.maestro_ninos_id) || 0) + 1
      )
  })

  const filtroGrupo = (nombre: string) => {
    const grupoId = grupos?.find((g) => g.nombre === nombre)?.id
    if (!grupoId) return []
    const ids = (miembros ?? [])
      .filter((m) => m.grupo_id === grupoId)
      .map((m) => m.maestro_id)
    return ids
      .map((id) => {
        const m = maestros?.find((x) => x.id === id)
        return m
          ? { id: m.id, nombres: m.nombres, apellidos: m.apellidos }
          : null
      })
      .filter(Boolean)
  }

  const maestrosPrincipales = filtroGrupo('principales') as { id: string; nombres: string; apellidos: string }[]
  const maestrosAyudantes = filtroGrupo('ayudantes') as { id: string; nombres: string; apellidos: string }[]
  const maestrosNinos = filtroGrupo('ninos') as { id: string; nombres: string; apellidos: string }[]

  // Preparar datos para el reporte
  const semanasConDatos = (semanas ?? []).map((s) => {
    const a = mapaAsignaciones.get(s.id)
    return {
      id: s.id,
      fecha: s.fecha,
      tema: s.tema,
      pasaje_biblico: s.pasaje_biblico,
      versiculo_memorizar: s.versiculo_memorizar,
      manualidad: s.manualidad,
      actividad_ninos: s.actividad_ninos || null,
      principal: a?.maestro_principal_id
        ? mapaMaestros.get(a.maestro_principal_id) || '—'
        : 'Sin asignar',
      ayudante: a?.maestro_ayudante_id
        ? mapaMaestros.get(a.maestro_ayudante_id) || '—'
        : 'Sin asignar',
      ninos: a?.maestro_ninos_id
        ? mapaMaestros.get(a.maestro_ninos_id) || '—'
        : 'Sin asignar',
    }
  })

  const maestrosConConteos = [
    ...maestrosPrincipales.map((m) => ({
      ...m,
      grupo: 'Principal',
      total: conteoPrincipal.get(m.id) || 0,
    })),
    ...maestrosAyudantes.map((m) => ({
      ...m,
      grupo: 'Ayudante',
      total: conteoAyudante.get(m.id) || 0,
    })),
    ...maestrosNinos.map((m) => ({
      ...m,
      grupo: 'Niños',
      total: conteoNinos.get(m.id) || 0,
    })),
  ]

  return (
    <ReportesCliente
      semanas={semanasConDatos}
      maestros={maestrosConConteos}
    />
  )
}
