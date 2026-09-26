import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') {
    return NextResponse.json(
      { exito: false, mensaje: 'Solo administradores', asignadas: 0, detalle: [] },
      { status: 403 }
    )
  }

  const hoy = new Date().toISOString().split('T')[0]

  const { data: todasSemanas } = await supabase
    .from('semanas')
    .select('id, fecha, tema')
    .order('fecha', { ascending: true })

  if (!todasSemanas || todasSemanas.length === 0) {
    return NextResponse.json({
      exito: false,
      mensaje: 'No hay semanas registradas.',
      asignadas: 0,
      detalle: [],
    })
  }

  const semanasFuturas = todasSemanas.filter((s) => s.fecha >= hoy)

  if (semanasFuturas.length === 0) {
    return NextResponse.json({
      exito: false,
      mensaje: 'No hay semanas futuras para asignar.',
      asignadas: 0,
      detalle: [],
    })
  }

  const { data: grupos } = await supabase.from('grupos').select('id, nombre')
  const { data: miembros } = await supabase
    .from('grupo_maestros')
    .select('grupo_id, maestro_id')
  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos, activo')
    .eq('activo', true)

  const mapaMaestros = new Map((maestros ?? []).map((m) => [m.id, m]))

  const filtroGrupo = (nombre: string) => {
    const grupoId = grupos?.find((g) => g.nombre === nombre)?.id
    if (!grupoId) return []
    return (miembros ?? [])
      .filter((m) => m.grupo_id === grupoId)
      .map((m) => mapaMaestros.get(m.maestro_id))
      .filter(Boolean) as { id: string; nombres: string; apellidos: string }[]
  }

  const gruposMaestros = {
    principales: filtroGrupo('principales'),
    ayudantes: filtroGrupo('ayudantes'),
    ninos: filtroGrupo('ninos'),
  }

  const { data: asignacionesExistentes } = await supabase
    .from('asignaciones')
    .select('*')

  const mapaAsignaciones = new Map(
    (asignacionesExistentes ?? []).map((a) => [a.semana_id, a])
  )

  const { data: todosMaestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos')
  const mapaTodos = new Map(
    (todosMaestros ?? []).map((m) => [m.id, `${m.nombres} ${m.apellidos}`])
  )

  // 🆕 Historial por rol: última fecha en que sirvió cada maestro EN CADA ROL
  const ultimaFechaPorRol: {
    principales: Map<string, string>
    ayudantes: Map<string, string>
    ninos: Map<string, string>
  } = {
    principales: new Map(),
    ayudantes: new Map(),
    ninos: new Map(),
  }

  // Mapa: semana_id -> [todos los ids que sirvieron]
  const idsPorSemana = new Map<string, string[]>()

  // También contamos cuántas veces cada maestro ha servido en cada rol
  // (esto reemplaza el conteo global anterior)
  ;(asignacionesExistentes ?? []).forEach((a) => {
    const semana = todasSemanas.find((s) => s.id === a.semana_id)
    if (!semana) return

    // Actualizar última fecha por rol
    if (a.maestro_principal_id) {
      const prev = ultimaFechaPorRol.principales.get(a.maestro_principal_id)
      if (!prev || semana.fecha > prev) {
        ultimaFechaPorRol.principales.set(a.maestro_principal_id, semana.fecha)
      }
    }
    if (a.maestro_ayudante_id) {
      const prev = ultimaFechaPorRol.ayudantes.get(a.maestro_ayudante_id)
      if (!prev || semana.fecha > prev) {
        ultimaFechaPorRol.ayudantes.set(a.maestro_ayudante_id, semana.fecha)
      }
    }
    if (a.maestro_ninos_id) {
      const prev = ultimaFechaPorRol.ninos.get(a.maestro_ninos_id)
      if (!prev || semana.fecha > prev) {
        ultimaFechaPorRol.ninos.set(a.maestro_ninos_id, semana.fecha)
      }
    }

    // Actualizar ids por semana
    const ids = [
      a.maestro_principal_id,
      a.maestro_ayudante_id,
      a.maestro_ninos_id,
    ].filter(Boolean) as string[]
    idsPorSemana.set(a.semana_id, ids)
  })

  let asignadas = 0
  const detalle: Array<{
    fecha: string
    tema: string
    principal: string
    ayudante: string
    ninos: string
    cambio: boolean
  }> = []

  for (let i = 0; i < semanasFuturas.length; i++) {
    const semana = semanasFuturas[i]

    // 🆕 Calcular IDs que sirvieron en las últimas 3 semanas (regla de descanso)
    const idsEnDescanso: string[] = []

    for (let offset = 1; offset <= 3; offset++) {
      const idxAnterior = i - offset
      let semanaAnteriorId: string | null = null

      if (idxAnterior >= 0) {
        semanaAnteriorId = semanasFuturas[idxAnterior].id
      } else {
        const semanasPasadas = todasSemanas.filter((s) => s.fecha < hoy)
        const idxPasada = semanasPasadas.length + idxAnterior
        if (idxPasada >= 0 && idxPasada < semanasPasadas.length) {
          semanaAnteriorId = semanasPasadas[idxPasada].id
        }
      }

      if (semanaAnteriorId) {
        const ids = idsPorSemana.get(semanaAnteriorId) || []
        idsEnDescanso.push(...ids)
      }
    }

    const asignacionActual = mapaAsignaciones.get(semana.id)

    const yaAsignado = {
      principal: asignacionActual?.maestro_principal_id || null,
      ayudante: asignacionActual?.maestro_ayudante_id || null,
      ninos: asignacionActual?.maestro_ninos_id || null,
    }

    // 🆕 Función de elección: prioriza al que hace MÁS TIEMPO no sirve en ese ROL
    const elegir = (
      grupo: 'principales' | 'ayudantes' | 'ninos',
      yaAsignadosEnSemana: (string | null)[]
    ) => {
      // Candidatos base: del grupo, sin los ya asignados esta semana
      const candidatosBase = gruposMaestros[grupo].filter(
        (m) => !yaAsignadosEnSemana.includes(m.id)
      )

      // Filtrar a los que NO están en descanso obligatorio
      const candidatosDescansados = candidatosBase.filter(
        (m) => !idsEnDescanso.includes(m.id)
      )

      // Preferir descansados; si no hay, usar todos (fallback)
      const candidatos =
        candidatosDescansados.length > 0 ? candidatosDescansados : candidatosBase

      if (candidatos.length === 0) return { maestro: null, usoFallback: false }

      // Ordenar: 
      //  1. Menor uso total en ese ROL (para balancear)
      //  2. Última fecha más antigua (el que hace más tiempo no sirve EN ESE ROL)
      //  3. Alfabético como desempate
      candidatos.sort((a, b) => {
        // Contar cuántas veces ha servido en este rol
        const conteoA = contarRol(a.id, grupo)
        const conteoB = contarRol(b.id, grupo)

        if (conteoA !== conteoB) return conteoA - conteoB

        // Si empatan en conteo, priorizar al que hace más tiempo no sirve
        const fechaA = ultimaFechaPorRol[grupo].get(a.id) || '1900-01-01'
        const fechaB = ultimaFechaPorRol[grupo].get(b.id) || '1900-01-01'

        if (fechaA !== fechaB) return fechaA.localeCompare(fechaB)

        // Desempate alfabético
        return `${a.nombres} ${a.apellidos}`.localeCompare(
          `${b.nombres} ${b.apellidos}`,
          'es'
        )
      })

      return {
        maestro: candidatos[0],
        usoFallback: candidatosDescansados.length === 0,
      }
    }

    // Función auxiliar: contar cuántas veces ha servido un maestro en un rol
    const contarRol = (maestroId: string, grupo: string): number => {
      let count = 0
      ;(asignacionesExistentes ?? []).forEach((a) => {
        if (grupo === 'principales' && a.maestro_principal_id === maestroId)
          count++
        if (grupo === 'ayudantes' && a.maestro_ayudante_id === maestroId)
          count++
        if (grupo === 'ninos' && a.maestro_ninos_id === maestroId) count++
      })
      return count
    }

    const datosAsignacion: any = {
      semana_id: semana.id,
      maestro_principal_id: yaAsignado.principal,
      maestro_ayudante_id: yaAsignado.ayudante,
      maestro_ninos_id: yaAsignado.ninos,
    }

    let cambio = false

    if (!datosAsignacion.maestro_principal_id) {
      const { maestro: m } = elegir('principales', [
        datosAsignacion.maestro_ayudante_id,
        datosAsignacion.maestro_ninos_id,
      ].filter(Boolean))
      if (m) {
        datosAsignacion.maestro_principal_id = m.id
        cambio = true
      }
    }

    if (!datosAsignacion.maestro_ayudante_id) {
      const { maestro: m } = elegir('ayudantes', [
        datosAsignacion.maestro_principal_id,
        datosAsignacion.maestro_ninos_id,
      ].filter(Boolean))
      if (m) {
        datosAsignacion.maestro_ayudante_id = m.id
        cambio = true
      }
    }

    if (!datosAsignacion.maestro_ninos_id) {
      const { maestro: m } = elegir('ninos', [
        datosAsignacion.maestro_principal_id,
        datosAsignacion.maestro_ayudante_id,
      ].filter(Boolean))
      if (m) {
        datosAsignacion.maestro_ninos_id = m.id
        cambio = true
      }
    }

    if (cambio) {
      await supabase
        .from('asignaciones')
        .upsert(datosAsignacion, { onConflict: 'semana_id' })
      asignadas++

      // 🆕 Actualizar el historial interno para esta semana
      const idsEstaSemana = [
        datosAsignacion.maestro_principal_id,
        datosAsignacion.maestro_ayudante_id,
        datosAsignacion.maestro_ninos_id,
      ].filter(Boolean) as string[]

      idsPorSemana.set(semana.id, idsEstaSemana)

      // Actualizar última fecha por rol para los nuevos asignados
      if (datosAsignacion.maestro_principal_id) {
        const prev = ultimaFechaPorRol.principales.get(
          datosAsignacion.maestro_principal_id
        )
        if (!prev || semana.fecha > prev) {
          ultimaFechaPorRol.principales.set(
            datosAsignacion.maestro_principal_id,
            semana.fecha
          )
        }
      }
      if (datosAsignacion.maestro_ayudante_id) {
        const prev = ultimaFechaPorRol.ayudantes.get(
          datosAsignacion.maestro_ayudante_id
        )
        if (!prev || semana.fecha > prev) {
          ultimaFechaPorRol.ayudantes.set(
            datosAsignacion.maestro_ayudante_id,
            semana.fecha
          )
        }
      }
      if (datosAsignacion.maestro_ninos_id) {
        const prev = ultimaFechaPorRol.ninos.get(
          datosAsignacion.maestro_ninos_id
        )
        if (!prev || semana.fecha > prev) {
          ultimaFechaPorRol.ninos.set(
            datosAsignacion.maestro_ninos_id,
            semana.fecha
          )
        }
      }

      // Añadir al listado global para futuras iteraciones
      asignacionesExistentes?.push(datosAsignacion)
    }

    mapaAsignaciones.set(semana.id, datosAsignacion)

    const nombre = (id: string | null) => {
      if (!id) return 'Sin asignar'
      return mapaTodos.get(id) || 'Sin asignar'
    }

    detalle.push({
      fecha: semana.fecha,
      tema: semana.tema || '(Sin tema registrado)',
      principal: nombre(datosAsignacion.maestro_principal_id),
      ayudante: nombre(datosAsignacion.maestro_ayudante_id),
      ninos: nombre(datosAsignacion.maestro_ninos_id),
      cambio,
    })
  }

  return NextResponse.json({
    exito: true,
    mensaje: `Se generaron ${asignadas} asignación${
      asignadas === 1 ? '' : 'es'
    } automáticamente en ${semanasFuturas.length} semanas.`,
    asignadas,
    detalle,
  })
}
