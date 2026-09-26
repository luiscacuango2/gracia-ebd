'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Maestro = {
  id: string
  nombres: string
  apellidos: string
  activo: boolean
}

export default function GestionGrupo({
  grupoId,
  maestros,
  idsAsignados,
}: {
  grupoId: string
  maestros: Maestro[]
  idsAsignados: string[]
}) {
  const router = useRouter()
  const [seleccionados, setSeleccionados] = useState<string[]>(idsAsignados)
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const toggle = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleGuardar = async () => {
    setCargando(true)
    setMensaje('')
    const supabase = createClient()

    await supabase.from('grupo_maestros').delete().eq('grupo_id', grupoId)

    if (seleccionados.length > 0) {
      const inserts = seleccionados.map((maestro_id) => ({
        grupo_id: grupoId,
        maestro_id,
      }))
      const { error } = await supabase.from('grupo_maestros').insert(inserts)
      if (error) {
        setMensaje('❌ Error: ' + error.message)
        setCargando(false)
        return
      }
    }

    setMensaje('✅ Grupo actualizado correctamente')
    router.refresh()
    setCargando(false)
  }

  // 🆕 Ordenar maestros alfabéticamente
  const maestrosOrdenados = [...maestros].sort((a, b) =>
    `${a.nombres} ${a.apellidos}`.localeCompare(
      `${b.nombres} ${b.apellidos}`,
      'es'
    )
  )

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        Marca los maestros que pertenecen a este grupo:
      </p>

      <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
        {maestrosOrdenados.map((m) => (
          <label
            key={m.id}
            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={seleccionados.includes(m.id)}
              onChange={() => toggle(m.id)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">
              {m.nombres} {m.apellidos}
            </span>
          </label>
        ))}
      </div>

      {mensaje && (
        <p className="text-sm text-center text-gray-700 mb-4">{mensaje}</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleGuardar}
          disabled={cargando}
          className="px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50"
          style={{ backgroundColor: '#E31E24' }}
        >
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          onClick={() => router.push('/dashboard/grupos')}
          className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    </div>
  )
}
