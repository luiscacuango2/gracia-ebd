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

  // Semanas futuras (para el listado principal)
  const { data: semanas } = await supabase
    .from('semanas')
    .select('*')
    .gte('fecha', hoy)
    .order('fecha', { ascending: true })

  // Todas las semanas (para los conteos)
  const { data: todasSemanas } = await supabase
    .from('semanas')
    .select('id, fecha')

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

  const todosMaestros = (maestros ?? []).map((m) => ({
    id: m.id,
    nombres: m.nombres,
    apellidos: m.apellidos,
  }))

  const mapaMaestros = new Map((maestros ?? []).map((m) => [m.id, m]))
  const mapaAsignaciones = new Map(
    (asignaciones ?? []).map((a) => [a.semana_id, a])
  )
  const mapaSemanas = new Map((todasSemanas ?? []).map((s) => [s.id, s.fecha]))

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

  // 🆕 Contar asignaciones por periodo (pasadas, futuras, todas)
  const contarPorPeriodo = (periodo: 'pasadas' | 'futuras' | 'todas') => {
    const conteo = {
      principales: new Map<string, number>(),
      ayudantes: new Map<string, number>(),
      ninos: new Map<string, number>(),
    }

    ;(asignaciones ?? []).forEach((a) => {
      const fecha = mapaSemanas.get(a.semana_id)
      if (!fecha) return

      // Filtrar por periodo
      const esPasada = fecha < hoy
      const esFutura = fecha >= hoy

      if (periodo === 'pasadas' && !esPasada) return
      if (periodo === 'futuras' && !esFutura) return

      if (a.maestro_principal_id)
        conteo.principales.set(
          a.maestro_principal_id,
          (conteo.principales.get(a.maestro_principal_id) || 0) + 1
        )
      if (a.maestro_ayudante_id)
        conteo.ayudantes.set(
          a.maestro_ayudante_id,
          (conteo.ayudantes.get(a.maestro_ayudante_id) || 0) + 1
        )
      if (a.maestro_ninos_id)
        conteo.ninos.set(
          a.maestro_ninos_id,
          (conteo.ninos.get(a.maestro_ninos_id) || 0) + 1
        )
    })

    return conteo
  }

  const conteoPasadas = contarPorPeriodo('pasadas')
  const conteoFuturas = contarPorPeriodo('futuras')
  const conteoTodas = contarPorPeriodo('todas')

  // Función para mapear grupo con sus 3 conteos
  const mapearGrupo = (grupo: any[]) =>
    grupo.map((m: any) => ({
      id: m.id,
      nombres: m.nombres,
      apellidos: m.apellidos,
      totalPasadas: conteoPasadas.principales.get(m.id) || 0,
      totalFuturas: conteoFuturas.principales.get(m.id) || 0,
      totalTodas: conteoTodas.principales.get(m.id) || 0,
    }))

  const mapearGrupoAyudantes = (grupo: any[]) =>
    grupo.map((m: any) => ({
      id: m.id,
      nombres: m.nombres,
      apellidos: m.apellidos,
      totalPasadas: conteoPasadas.ayudantes.get(m.id) || 0,
      totalFuturas: conteoFuturas.ayudantes.get(m.id) || 0,
      totalTodas: conteoTodas.ayudantes.get(m.id) || 0,
    }))

  const mapearGrupoNinos = (grupo: any[]) =>
    grupo.map((m: any) => ({
      id: m.id,
      nombres: m.nombres,
      apellidos: m.apellidos,
      totalPasadas: conteoPasadas.ninos.get(m.id) || 0,
      totalFuturas: conteoFuturas.ninos.get(m.id) || 0,
      totalTodas: conteoTodas.ninos.get(m.id) || 0,
    }))

  return (
    <RotacionCliente
      semanas={(semanas ?? []).map((s) => ({
        id: s.id,
        fecha: s.fecha,
        tema: s.tema,
        pasaje_biblico: s.pasaje_biblico,
        versiculo_memorizar: s.versiculo_memorizar,
        manualidad: s.manualidad,
        actividad_ninos: s.actividad_ninos || null,
        asignacion: mapaAsignaciones.get(s.id) || null,
      }))}
      todosMaestros={todosMaestros}
      gruposInfo={{
        principales: mapearGrupo(gruposInfo.principales),
        ayudantes: mapearGrupoAyudantes(gruposInfo.ayudantes),
        ninos: mapearGrupoNinos(gruposInfo.ninos),
      }}
    />
  )
}
