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

  const { data: restricciones } = await supabase
    .from('restricciones_maestros')
    .select('maestro_1_id, maestro_2_id')

  const { data: ausencias } = await supabase
    .from('ausencias_maestros')
    .select('maestro_id, fecha_desde, fecha_hasta')

  const mapaRestricciones = new Map<string, string[]>()
  ;(restricciones ?? []).forEach((r) => {
    if (!r.maestro_1_id || !r.maestro_2_id) return
    if (!mapaRestricciones.has(r.maestro_1_id))
      mapaRestricciones.set(r.maestro_1_id, [])
    if (!mapaRestricciones.has(r.maestro_2_id))
      mapaRestricciones.set(r.maestro_2_id, [])
    mapaRestricciones.get(r.maestro_1_id)!.push(r.maestro_2_id)
    mapaRestricciones.get(r.maestro_2_id)!.push(r.maestro_1_id)
  })

  const estaAusente = (maestroId: string, fecha: string): boolean => {
    return (ausencias ?? []).some(
      (a) =>
        a.maestro_id === maestroId &&
        a.fecha_desde <= fecha &&
        a.fecha_hasta >= fecha
    )
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

  const conteoPorRol = {
    principales: new Map<string, number>(),
    ayudantes: new Map<string, number>(),
    ninos: new Map<string, number>(),
  }

  ;(asignacionesExistentes ?? []).forEach((a) => {
    if (a.maestro_principal_id)
      conteoPorRol.principales.set(
        a.maestro_principal_id,
        (conteoPorRol.principales.get(a.maestro_principal_id) || 0) + 1
      )
    if (a.maestro_ayudante_id)
      conteoPorRol.ayudantes.set(
        a.maestro_ayudante_id,
        (conteoPorRol.ayudantes.get(a.maestro_ayudante_id) || 0) + 1
      )
    if (a.maestro_ninos_id)
      conteoPorRol.ninos.set(
        a.maestro_ninos_id,
        (conteoPorRol.ninos.get(a.maestro_ninos_id) || 0) + 1
      )
  })

  // Mapa global de servicio por maestro
  const semanasQueSirvioPorMaestro = new Map<string, Set<number>>()

  const registrarServicio = (maestroId: string, indexSemana: number) => {
    if (!semanasQueSirvioPorMaestro.has(maestroId)) {
      semanasQueSirvioPorMaestro.set(maestroId, new Set())
    }
    semanasQueSirvioPorMaestro.get(maestroId)!.add(indexSemana)
  }

  // Cargar historial existente
  ;(asignacionesExistentes ?? []).forEach((a) => {
    const idx = todasSemanas.findIndex((s) => s.id === a.semana_id)
    if (idx === -1) return
    if (a.maestro_principal_id) registrarServicio(a.maestro_principal_id, idx)
    if (a.maestro_ayudante_id) registrarServicio(a.maestro_ayudante_id, idx)
    if (a.maestro_ninos_id) registrarServicio(a.maestro_ninos_id, idx)
  })

  const puedeServirEnSemana = (
    maestroId: string,
    indexSemana: number
  ): boolean => {
    const semanas = semanasQueSirvioPorMaestro.get(maestroId)
    if (!semanas) return true

    for (let offset = 1; offset <= 4; offset++) {
      if (semanas.has(indexSemana - offset)) return false
    }
    for (let offset = 1; offset <= 4; offset++) {
      if (semanas.has(indexSemana + offset)) return false
    }
    return true
  }

  let asignadas = 0
  let semanasConFallback = 0
  const detalle: Array<{
    fecha: string
    tema: string
    principal: string
    ayudante: string
    ninos: string
    cambio: boolean
    nota?: string
  }> = []

  // 🆕 Función de elección con 3 NIVELES de fallback
  const elegir = (
    grupo: 'principales' | 'ayudantes' | 'ninos',
    indexSemana: number,
    fechaSemana: string,
    yaAsignadosEstaSemana: string[]
  ): { maestro: any; fallback: 'ninguno' | 'descanso' | 'restriccion' } | null => {
    const todosCandidatos = gruposMaestros[grupo]

    // NIVEL 1: Estricto (respeta todo)
    const nivel1 = todosCandidatos.filter((m) => {
      if (yaAsignadosEstaSemana.includes(m.id)) return false
      if (estaAusente(m.id, fechaSemana)) return false
      if (!puedeServirEnSemana(m.id, indexSemana)) return false
      const restriccionesDeEste = mapaRestricciones.get(m.id) || []
      if (yaAsignadosEstaSemana.some((id) => restriccionesDeEste.includes(id)))
        return false
      return true
    })

    if (nivel1.length > 0) {
      nivel1.sort((a, b) => {
        const usoA = conteoPorRol[grupo].get(a.id) || 0
        const usoB = conteoPorRol[grupo].get(b.id) || 0
        if (usoA !== usoB) return usoA - usoB
        return `${a.nombres} ${a.apellidos}`.localeCompare(
          `${b.nombres} ${b.apellidos}`,
          'es'
        )
      })
      return { maestro: nivel1[0], fallback: 'ninguno' }
    }

    // NIVEL 2: Relajar descanso (mantener ausencias y restricciones)
    const nivel2 = todosCandidatos.filter((m) => {
      if (yaAsignadosEstaSemana.includes(m.id)) return false
      if (estaAusente(m.id, fechaSemana)) return false
      const restriccionesDeEste = mapaRestricciones.get(m.id) || []
      if (yaAsignadosEstaSemana.some((id) => restriccionesDeEste.includes(id)))
        return false
      return true
    })

    if (nivel2.length > 0) {
      // Priorizar al que hace MÁS tiempo no sirvió (menos reciente)
      nivel2.sort((a, b) => {
        const semanasA = semanasQueSirvioPorMaestro.get(a.id) || new Set()
        const semanasB = semanasQueSirvioPorMaestro.get(b.id) || new Set()
        const ultA = semanasA.size > 0 ? Math.max(...Array.from(semanasA)) : -9999
        const ultB = semanasB.size > 0 ? Math.max(...Array.from(semanasB)) : -9999
        if (ultA !== ultB) return ultA - ultB

        const usoA = conteoPorRol[grupo].get(a.id) || 0
        const usoB = conteoPorRol[grupo].get(b.id) || 0
        if (usoA !== usoB) return usoA - usoB
        return `${a.nombres} ${a.apellidos}`.localeCompare(
          `${b.nombres} ${b.apellidos}`,
          'es'
        )
      })
      return { maestro: nivel2[0], fallback: 'descanso' }
    }

    // NIVEL 3: Relajar también restricciones (último recurso)
    const nivel3 = todosCandidatos.filter((m) => {
      if (yaAsignadosEstaSemana.includes(m.id)) return false
      if (estaAusente(m.id, fechaSemana)) return false
      return true
    })

    if (nivel3.length > 0) {
      nivel3.sort((a, b) => {
        const semanasA = semanasQueSirvioPorMaestro.get(a.id) || new Set()
        const semanasB = semanasQueSirvioPorMaestro.get(b.id) || new Set()
        const ultA = semanasA.size > 0 ? Math.max(...Array.from(semanasA)) : -9999
        const ultB = semanasB.size > 0 ? Math.max(...Array.from(semanasB)) : -9999
        if (ultA !== ultB) return ultA - ultB

        const usoA = conteoPorRol[grupo].get(a.id) || 0
        const usoB = conteoPorRol[grupo].get(b.id) || 0
        return usoA - usoB
      })
      return { maestro: nivel3[0], fallback: 'restriccion' }
    }

    return null
  }

  for (let i = 0; i < semanasFuturas.length; i++) {
    const semana = semanasFuturas[i]
    const indexGlobal = todasSemanas.findIndex((s) => s.id === semana.id)

    const asignacionActual = mapaAsignaciones.get(semana.id)

    const datosAsignacion: any = {
      semana_id: semana.id,
      maestro_principal_id: asignacionActual?.maestro_principal_id || null,
      maestro_ayudante_id: asignacionActual?.maestro_ayudante_id || null,
      maestro_ninos_id: asignacionActual?.maestro_ninos_id || null,
    }

    if (
      datosAsignacion.maestro_principal_id &&
      datosAsignacion.maestro_ayudante_id &&
      datosAsignacion.maestro_ninos_id
    ) {
      detalle.push({
        fecha: semana.fecha,
        tema: semana.tema || '(Sin tema registrado)',
        principal: mapaTodos.get(datosAsignacion.maestro_principal_id) || '—',
        ayudante: mapaTodos.get(datosAsignacion.maestro_ayudante_id) || '—',
        ninos: mapaTodos.get(datosAsignacion.maestro_ninos_id) || '—',
        cambio: false,
      })
      continue
    }

    let cambio = false
    let usoFallbackEstaSemana = false

    // Principal
    if (!datosAsignacion.maestro_principal_id) {
      const res = elegir(
        'principales',
        indexGlobal,
        semana.fecha,
        [
          datosAsignacion.maestro_ayudante_id,
          datosAsignacion.maestro_ninos_id,
        ].filter(Boolean)
      )
      if (res) {
        datosAsignacion.maestro_principal_id = res.maestro.id
        registrarServicio(res.maestro.id, indexGlobal)
        conteoPorRol.principales.set(
          res.maestro.id,
          (conteoPorRol.principales.get(res.maestro.id) || 0) + 1
        )
        cambio = true
        if (res.fallback !== 'ninguno') usoFallbackEstaSemana = true
      }
    }

    // Ayudante
    if (!datosAsignacion.maestro_ayudante_id) {
      const res = elegir(
        'ayudantes',
        indexGlobal,
        semana.fecha,
        [
          datosAsignacion.maestro_principal_id,
          datosAsignacion.maestro_ninos_id,
        ].filter(Boolean)
      )
      if (res) {
        datosAsignacion.maestro_ayudante_id = res.maestro.id
        registrarServicio(res.maestro.id, indexGlobal)
        conteoPorRol.ayudantes.set(
          res.maestro.id,
          (conteoPorRol.ayudantes.get(res.maestro.id) || 0) + 1
        )
        cambio = true
        if (res.fallback !== 'ninguno') usoFallbackEstaSemana = true
      }
    }

    // Niños
    if (!datosAsignacion.maestro_ninos_id) {
      const res = elegir(
        'ninos',
        indexGlobal,
        semana.fecha,
        [
          datosAsignacion.maestro_principal_id,
          datosAsignacion.maestro_ayudante_id,
        ].filter(Boolean)
      )
      if (res) {
        datosAsignacion.maestro_ninos_id = res.maestro.id
        registrarServicio(res.maestro.id, indexGlobal)
        conteoPorRol.ninos.set(
          res.maestro.id,
          (conteoPorRol.ninos.get(res.maestro.id) || 0) + 1
        )
        cambio = true
        if (res.fallback !== 'ninguno') usoFallbackEstaSemana = true
      }
    }

    if (usoFallbackEstaSemana) semanasConFallback++

    if (cambio) {
      await supabase
        .from('asignaciones')
        .upsert(datosAsignacion, { onConflict: 'semana_id' })
      asignadas++
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
      nota: usoFallbackEstaSemana
        ? '⚠️ Se relajó alguna regla por falta de maestros disponibles'
        : undefined,
    })
  }

  const mensajeExtra =
    semanasConFallback > 0
      ? ` ⚠️ ${semanasConFallback} semana${semanasConFallback === 1 ? '' : 's'} usaron fallback (no había suficientes maestros disponibles para respetar todas las reglas).`
      : ''

  return NextResponse.json({
    exito: true,
    mensaje: `Se generaron ${asignadas} asignación${
      asignadas === 1 ? '' : 'es'
    } automáticamente en ${semanasFuturas.length} semanas.${mensajeExtra}`,
    asignadas,
    semanasConFallback,
    detalle,
  })
}
