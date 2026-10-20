'use client'

import { useState } from 'react'
import ModalAsignarMaestros from './ModalAsignarMaestros'

type Maestro = {
  id: string
  nombres: string
  apellidos: string
  activo: boolean
}

export default function BotonAsignarMaestros({
  semanaId,
  semanaTema,
  semanaFecha,
  maestrosPrincipales,
  maestrosAyudantes,
  maestrosNinos,
  asignacionActual,
}: {
  semanaId: string
  semanaTema: string
  semanaFecha: string
  maestrosPrincipales: Maestro[]
  maestrosAyudantes: Maestro[]
  maestrosNinos: Maestro[]
  asignacionActual: { principal: string; ayudante: string; ninos: string }
}) {
  const [abierto, setAbierto] = useState(false)
  const [modo, setModo] = useState<'asignar' | 'modificar'>('asignar')

  // ¿Ya tiene alguna asignación?
  const tieneAsignacion =
    asignacionActual.principal ||
    asignacionActual.ayudante ||
    asignacionActual.ninos

  const handleAbrir = () => {
    setModo(tieneAsignacion ? 'modificar' : 'asignar')
    setAbierto(true)
  }

  return (
    <>
      <button
        onClick={handleAbrir}
        className={`inline-block px-4 py-2 rounded-lg border text-sm font-medium ${
          tieneAsignacion
            ? 'border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            : 'border-red-600 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        }`}
      >
        {tieneAsignacion ? '✏️ Modificar maestros' : '👥 Asignar maestros'}
      </button>

      <ModalAsignarMaestros
        semanaId={semanaId}
        semanaTema={semanaTema}
        semanaFecha={semanaFecha}
        maestrosPrincipales={maestrosPrincipales}
        maestrosAyudantes={maestrosAyudantes}
        maestrosNinos={maestrosNinos}
        asignacionActual={asignacionActual}
        modo={modo}
        abierto={abierto}
        onCerrar={() => setAbierto(false)}
      />
    </>
  )
}