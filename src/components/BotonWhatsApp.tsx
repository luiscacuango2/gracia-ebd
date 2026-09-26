'use client'

import { useState } from 'react'
import { obtenerSaludoEcuador } from '@/lib/saludos'

type Semana = {
  fecha: string
  tema: string
  pasaje_biblico: string | null
  versiculo_memorizar: string | null
  manualidad: string | null
actividad_ninos: string | null //
}

type Maestro = {
  nombres: string
  apellidos: string
}

type Asignacion = {
  principal: Maestro | null
  ayudante: Maestro | null
  ninos: Maestro | null
}

export default function BotonWhatsApp({
  semana,
  esAdmin,
  asignacion,
}: {
  semana: Semana
  esAdmin: boolean
  asignacion: Asignacion
}) {
  const [previewActivo, setPreviewActivo] = useState<string | null>(null)

  const { saludo, despedida } = obtenerSaludoEcuador()

  const mensajeNinos = () => {
    const lineas: string[] = []
    lineas.push(
      `${saludo}, amados papitos, les envío el versículo para este domingo`
    )
    lineas.push('')
    if (semana.versiculo_memorizar) {
      lineas.push('*Versículo para memorizar:*')
      lineas.push(semana.versiculo_memorizar)
      lineas.push('')
    }
    lineas.push(`Dios les bendice, ${despedida}`)
    return lineas.join('\n').trim()
  }

  const mensajeMaestros = () => {
    const lineas: string[] = []
    lineas.push(
      'Hola a todos, les paso la elaboración de la clase de esta semana:'
    )
    lineas.push('')
    lineas.push('*Tema:*')
    lineas.push(semana.tema)
    lineas.push('')
    if (semana.pasaje_biblico) {
      lineas.push('*Versículos de estudio:*')
      lineas.push(semana.pasaje_biblico)
      lineas.push('')
    }
    if (semana.versiculo_memorizar) {
      lineas.push('*Versículo para memorizar:*')
      lineas.push(semana.versiculo_memorizar)
      lineas.push('')
    }
    if (semana.manualidad) {
      lineas.push('*Manualidad:*')
      lineas.push(semana.manualidad)
     lineas.push('')
    }

    if (semana.actividad_ninos) {
  lineas.push('*Actividad para niños:*')
  lineas.push(semana.actividad_ninos)
}
return lineas.join('\n').trim()
  }

  const mensajeConfirmacion = () => {
    const lineas: string[] = []
    lineas.push(`${saludo}, amados maestros, Papá les bendice.`)
    lineas.push('')
    lineas.push('Esta semana nos ayudan los siguientes maestros:')
    lineas.push('')
    if (asignacion.principal && asignacion.ayudante) {
      // 🆕 Solo el NOMBRE (sin apellido)
      lineas.push(
        `*Maestro principal:* ${asignacion.principal.nombres} y su ayudante: ${asignacion.ayudante.nombres}`
      )
    } else if (asignacion.principal) {
      lineas.push(`*Maestro principal:* ${asignacion.principal.nombres}`)
    } else {
      lineas.push('*Maestro principal:* Sin asignar')
    }
    lineas.push('')
    lineas.push('*Tema:*')
    lineas.push(semana.tema)
    lineas.push('')
    if (asignacion.ninos) {
      lineas.push('*Maestro de niños pequeños:*')
      // 🆕 Solo el NOMBRE (sin apellido)
      lineas.push(asignacion.ninos.nombres)
    } else {
      lineas.push('*Maestro de niños pequeños:* Sin asignar')
    }
    lineas.push('')
// 🆕 Actividad de niños
  if (semana.actividad_ninos) {
    lineas.push('*Actividad para niños pequeños:*')
    lineas.push(semana.actividad_ninos)
    lineas.push('')
  }
    lineas.push('Por favor confirmen su asistencia.')
    return lineas.join('\n').trim()
  }

  const mensajes = {
    ninos: {
      titulo: '👶 Padres de niños',
      texto: mensajeNinos(),
      color: '#3B82F6',
    },
    maestros: {
      titulo: '🧑‍🏫 Maestros',
      texto: mensajeMaestros(),
      color: '#25D366',
    },
    confirmacion: {
      titulo: '📢 Confirmación (admin)',
      texto: mensajeConfirmacion(),
      color: '#E31E24',
    },
  }

  const compartir = (texto: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      alert('✅ Mensaje copiado al portapapeles')
    } catch {
      alert('❌ No se pudo copiar. Selecciona el texto manualmente.')
    }
  }

  const tiposDisponibles = esAdmin
    ? (['ninos', 'maestros', 'confirmacion'] as const)
    : (['ninos', 'maestros'] as const)

  return (
    <div>
      <div className="space-y-2">
        {tiposDisponibles.map((tipo) => {
          const m = mensajes[tipo]
          return (
            <div key={tipo} className="p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600 flex-1 min-w-0 truncate">
                  {m.titulo}
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => compartir(m.texto)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium hover:opacity-90"
                    style={{ backgroundColor: m.color }}
                  >
                    📱 Enviar
                  </button>
                  <button
                    onClick={() =>
                      setPreviewActivo(previewActivo === tipo ? null : tipo)
                    }
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-white bg-white"
                  >
                    {previewActivo === tipo ? '✕' : '👁'}
                  </button>
                  <button
                    onClick={() => copiar(m.texto)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-medium hover:bg-white bg-white"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {previewActivo && (
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase">
            Vista previa:
          </p>
          <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-sans">
            {mensajes[previewActivo as keyof typeof mensajes].texto}
          </pre>
        </div>
      )}
    </div>
  )
}
