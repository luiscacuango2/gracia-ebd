import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function enviarEmailBrevo({
  to,
  toNombre,
  subject,
  html,
}: {
  to: string
  toNombre: string
  subject: string
  html: string
}): Promise<{ exito: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Gracia Iglesia Cristiana',
          email: process.env.BREVO_SENDER_EMAIL || 'noreply@gracia-ebd.com',
        },
        to: [{ email: to, name: toNombre }],
        subject,
        htmlContent: html,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return {
        exito: false,
        error: errorData.message || `HTTP ${res.status}`,
      }
    }
    return { exito: true }
  } catch (err: any) {
    return { exito: false, error: err.message }
  }
}

function formatearFecha(fechaStr: string): string {
  return new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function primerNombre(nombreCompleto: string): string {
  return nombreCompleto.split(' ')[0]
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('rol')
    .eq('correo', user?.email)
    .single()

  if (yo?.rol !== 'admin') {
    return NextResponse.json(
      { exito: false, mensaje: 'Solo administradores' },
      { status: 403 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const { semanaId, destinatarios } = body as {
    semanaId?: string
    destinatarios?: string[]
  }

  if (!semanaId) {
    return NextResponse.json(
      { exito: false, mensaje: 'Falta el ID de la semana' },
      { status: 400 }
    )
  }

  const { data: semana } = await supabase
    .from('semanas')
    .select('*')
    .eq('id', semanaId)
    .single()

  if (!semana) {
    return NextResponse.json(
      { exito: false, mensaje: 'Semana no encontrada' },
      { status: 404 }
    )
  }

  const { data: asignacion } = await supabase
    .from('asignaciones')
    .select('*')
    .eq('semana_id', semana.id)
    .maybeSingle()

  if (!asignacion) {
    return NextResponse.json({
      exito: false,
      mensaje: 'La semana no tiene maestros asignados.',
    })
  }

  const idsMaestros = [
    asignacion.maestro_principal_id,
    asignacion.maestro_ayudante_id,
    asignacion.maestro_ninos_id,
  ].filter(Boolean)

  const { data: maestros } = await supabase
    .from('maestros')
    .select('*')
    .in('id', idsMaestros)

  const mapaMaestros = new Map((maestros ?? []).map((m) => [m.id, m]))
  const fechaFormateada = formatearFecha(semana.fecha)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Nombres de los maestros del equipo
  const nombreCompleto = (id: string | null | undefined) => {
    if (!id) return 'Sin asignar'
    const m = mapaMaestros.get(id)
    return m ? `${m.nombres} ${m.apellidos}` : 'Sin asignar'
  }

  const principalNombre = nombreCompleto(asignacion.maestro_principal_id)
  const ayudanteNombre = nombreCompleto(asignacion.maestro_ayudante_id)

  const resultados: Array<{ email: string; rol: string; exito: boolean; error?: string }> = []

  const enviarPrincipal = !destinatarios || destinatarios.includes('principal')
  const enviarNinos = !destinatarios || destinatarios.includes('ninos')

  // ===== CORREO AL MAESTRO PRINCIPAL =====
  if (enviarPrincipal && asignacion.maestro_principal_id) {
    const principal = mapaMaestros.get(asignacion.maestro_principal_id)
    if (principal?.correo) {
      const enlaceEdicion = semana.token_publico
        ? `${baseUrl}/editar/${semana.token_publico}`
        : null

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <h1 style="color: #E31E24; text-align: center; margin-bottom: 5px;">GRACIA</h1>
          <p style="text-align: center; color: #666; margin-top: 0; font-size: 12px; letter-spacing: 2px;">IGLESIA CRISTIANA</p>
          
          <div style="background: #f9fafb; border-left: 4px solid #E31E24; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h2 style="color: #333; margin: 0 0 5px 0;">📅 Recordatorio de clase</h2>
            <p style="color: #666; margin: 0; font-size: 14px; text-transform: capitalize;">${fechaFormateada}</p>
          </div>

	  <p style="color: #333;">Hola <strong>${principal.nombres} ${principal.apellidos}</strong>,</p>
          <p style="color: #333;">Te recordamos tu clase como <strong>maestro principal</strong>. Aquí están los detalles:</p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">🎯 Tema:</strong><br><span style="color: #333;">${semana.tema}</span></p>
            ${semana.pasaje_biblico ? `<p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">📖 Versículos de estudio:</strong><br><span style="color: #333;">${semana.pasaje_biblico}</span></p>` : ''}
            ${semana.versiculo_memorizar ? `<p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">💭 Versículo para memorizar:</strong><br><span style="color: #333;">${semana.versiculo_memorizar}</span></p>` : ''}
            ${semana.manualidad ? `<p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">✂️ Manualidad:</strong><br><span style="color: #333;">${semana.manualidad}</span></p>` : ''}
            ${semana.actividad_ninos ? `<p style="margin: 0;"><strong style="color: #E31E24;">🧒 Actividad niños pequeños:</strong><br><span style="color: #333;">${semana.actividad_ninos}</span></p>` : ''}
          </div>

          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;"><strong>👥 Maestros que te acompañan:</strong></p>
            <p style="margin: 5px 0; color: #333; font-size: 14px;">🤝 Ayudante: <strong>${ayudanteNombre}</strong></p>
            <p style="margin: 5px 0; color: #333; font-size: 14px;">🧒 Niños: <strong>${nombreCompleto(asignacion.maestro_ninos_id)}</strong></p>
          </div>

          ${enlaceEdicion ? `
            <div style="text-align: center; margin: 25px 0;">
              <a href="${enlaceEdicion}" style="display: inline-block; background: #E31E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                ✏️ Modificar clase
              </a>
              <p style="font-size: 12px; color: #999; margin-top: 10px;">Puedes editar el tema, versículos, manualidad y actividad de niños.</p>
            </div>
          ` : ''}

          <p style="color: #333; margin-top: 25px;">Dios te bendice,<br><strong>Gracia Iglesia Cristiana</strong></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          <p style="font-size: 11px; color: #999; text-align: center;">Recordatorio automático de la Escuela Bíblica Dominical.</p>
        </div>
      `

      const res = await enviarEmailBrevo({
        to: principal.correo,
        toNombre: `${principal.nombres} ${principal.apellidos}`,
        subject: `📅 Recordatorio: Eres maestro principal - ${semana.tema}`,
        html,
      })

      resultados.push({
        email: principal.correo,
        rol: 'Principal',
        exito: res.exito,
        error: res.error,
      })
    }
  }

  // ===== CORREO AL MAESTRO DE NIÑOS =====
  if (enviarNinos && asignacion.maestro_ninos_id) {
    const maestroNinos = mapaMaestros.get(asignacion.maestro_ninos_id)
    if (maestroNinos?.correo) {
      const enlaceActividad = semana.token_publico
        ? `${baseUrl}/actividad/${semana.token_publico}`
        : null

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
          <h1 style="color: #E31E24; text-align: center; margin-bottom: 5px;">GRACIA</h1>
          <p style="text-align: center; color: #666; margin-top: 0; font-size: 12px; letter-spacing: 2px;">IGLESIA CRISTIANA</p>
          
          <div style="background: #f9fafb; border-left: 4px solid #E31E24; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h2 style="color: #333; margin: 0 0 5px 0;">📅 Recordatorio de clase</h2>
            <p style="color: #666; margin: 0; font-size: 14px; text-transform: capitalize;">${fechaFormateada}</p>
          </div>

	  <p style="color: #333;">Hola <strong>${maestroNinos.nombres} ${maestroNinos.apellidos}</strong>,</p>
          <p style="color: #333;">Te recordamos tu clase de <strong>niños pequeños</strong>. Aquí está la información:</p>

          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">🎯 Tema:</strong><br><span style="color: #333;">${semana.tema}</span></p>
            ${semana.pasaje_biblico ? `<p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">📖 Versículos de estudio:</strong><br><span style="color: #333;">${semana.pasaje_biblico}</span></p>` : ''}
            ${semana.versiculo_memorizar ? `<p style="margin: 0 0 15px 0;"><strong style="color: #E31E24;">💭 Versículo para memorizar:</strong><br><span style="color: #333;">${semana.versiculo_memorizar}</span></p>` : ''}
          </div>

          <!-- Equipo de maestros -->
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px;"><strong>👥 Equipo de maestros de esta clase:</strong></p>
            <p style="margin: 5px 0; color: #333; font-size: 14px;">🧑‍🏫 Principal: <strong>${principalNombre}</strong></p>
            <p style="margin: 5px 0; color: #333; font-size: 14px;">🤝 Ayudante: <strong>${ayudanteNombre}</strong></p>
          </div>

          <!-- Actividad para niños -->
          <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #92400e;"><strong>🧒 Actividad para los niños pequeños:</strong></p>
            ${semana.actividad_ninos ? `
              <p style="margin: 0; color: #333;">${semana.actividad_ninos}</p>
            ` : `
              <p style="margin: 0; color: #92400e; font-style: italic;">Aún no se ha registrado la actividad. Recuerda que debe estar relacionada con el tema (pintar, juegos, dinámicas, etc.).</p>
            `}
          </div>

          <!-- Botón para registrar la actividad -->
          ${enlaceActividad ? `
            <div style="text-align: center; margin: 25px 0;">
              <a href="${enlaceActividad}" style="display: inline-block; background: #E31E24; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                ✏️ ${semana.actividad_ninos ? 'Modificar actividad' : 'Registrar actividad'}
              </a>
              <p style="font-size: 12px; color: #999; margin-top: 10px;">Solo puedes editar la actividad para niños pequeños.</p>
            </div>
          ` : ''}

          <p style="color: #333; margin-top: 25px;">Dios te bendice,<br><strong>Gracia Iglesia Cristiana</strong></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
          <p style="font-size: 11px; color: #999; text-align: center;">Recordatorio automático de la Escuela Bíblica Dominical.</p>
        </div>
      `

      const res = await enviarEmailBrevo({
        to: maestroNinos.correo,
        toNombre: `${maestroNinos.nombres} ${maestroNinos.apellidos}`,
        subject: `📅 Recordatorio: Eres maestro de niños - ${semana.tema}`,
        html,
      })

      resultados.push({
        email: maestroNinos.correo,
        rol: 'Niños',
        exito: res.exito,
        error: res.error,
      })
    }
  }

  return NextResponse.json({
    exito: true,
    mensaje: `Recordatorios procesados para: ${semana.tema}`,
    fecha: semana.fecha,
    resultados,
  })
}

// GET para el cron automático
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const url = new URL(request.url)
  const tokenQuery = url.searchParams.get('token')
  const esLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'

  if (
    process.env.CRON_SECRET &&
    !esLocal &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    tokenQuery !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = await createClient()

  const manana = new Date()
  manana.setDate(manana.getDate() + 1)
  const fechaManana = manana.toISOString().split('T')[0]

  const { data: semana } = await supabase
    .from('semanas')
    .select('id')
    .eq('fecha', fechaManana)
    .maybeSingle()

  if (!semana) {
    return NextResponse.json({
      exito: true,
      mensaje: `No hay clase programada para mañana (${fechaManana}).`,
      fecha: fechaManana,
      resultados: [],
    })
  }

  const fakeRequest = new Request(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ semanaId: semana.id }),
  })

  return POST(fakeRequest)
}
