'use client'

type Maestro = {
  id: string
  nombres: string
  apellidos: string
  activo: boolean
}

type Props = {
  maestrosPrincipales: Maestro[]
  maestrosAyudantes: Maestro[]
  maestrosNinos: Maestro[]
  principalId: string
  ayudanteId: string
  ninosId: string
  onChange: (campo: 'principal' | 'ayudante' | 'ninos', valor: string) => void
}

export default function SelectorMaestros({
  maestrosPrincipales,
  maestrosAyudantes,
  maestrosNinos,
  principalId,
  ayudanteId,
  ninosId,
  onChange,
}: Props) {
  // Excluye los ya seleccionados en los otros campos
  const excluir = (excepto: 'principal' | 'ayudante' | 'ninos') => {
    const ids: string[] = []
    if (excepto !== 'principal' && principalId) ids.push(principalId)
    if (excepto !== 'ayudante' && ayudanteId) ids.push(ayudanteId)
    if (excepto !== 'ninos' && ninosId) ids.push(ninosId)
    return ids
  }

  const filtrar = (lista: Maestro[], excepto: 'principal' | 'ayudante' | 'ninos') => {
    const excluidos = excluir(excepto)
    return lista.filter((m) => !excluidos.includes(m.id))
  }

  const opcionesPrincipales = filtrar(maestrosPrincipales, 'principal')
  const opcionesAyudantes = filtrar(maestrosAyudantes, 'ayudante')
  const opcionesNinos = filtrar(maestrosNinos, 'ninos')

  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-1">
          👥 Asignación de maestros para esta semana
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Solo aparecen los maestros asignados a cada grupo. Gestiona los grupos en{" "}
          <a href="/dashboard/grupos" className="text-red-600 hover:underline">
            Grupos de maestros
          </a>
          .
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🧑‍🏫 Maestro principal
        </label>
        {opcionesPrincipales.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200">
            No hay maestros asignados al grupo "Principales".
            {principalId && ' (El seleccionado actualmente no está en el grupo)'}
          </p>
        ) : (
          <select
            value={principalId}
            onChange={(e) => onChange('principal', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="">— Sin asignar —</option>
            {opcionesPrincipales.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres} {m.apellidos}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🤝 Maestro ayudante
        </label>
        {opcionesAyudantes.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200">
            No hay maestros asignados al grupo "Ayudantes".
            {ayudanteId && ' (El seleccionado actualmente no está en el grupo)'}
          </p>
        ) : (
          <select
            value={ayudanteId}
            onChange={(e) => onChange('ayudante', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="">— Sin asignar —</option>
            {opcionesAyudantes.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres} {m.apellidos}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🧒 Maestro de niños
        </label>
        {opcionesNinos.length === 0 ? (
          <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded border border-gray-200">
            No hay maestros asignados al grupo "Niños pequeños".
            {ninosId && ' (El seleccionado actualmente no está en el grupo)'}
          </p>
        ) : (
          <select
            value={ninosId}
            onChange={(e) => onChange('ninos', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="">— Sin asignar —</option>
            {opcionesNinos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombres} {m.apellidos}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}
