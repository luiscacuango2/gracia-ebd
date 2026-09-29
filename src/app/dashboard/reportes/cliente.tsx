'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Semana = {
  id: string
  fecha: string
  tema: string
  pasaje_biblico: string | null
  versiculo_memorizar: string | null
  manualidad: string | null
  actividad_ninos: string | null
  principal: string
  ayudante: string
  ninos: string
}

type MaestroConteo = {
  id: string
  nombres: string
  apellidos: string
  grupo: string
  total: number
}

type TipoReporte = 'semanas' | 'maestros' | 'ninos'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function ReportesCliente({
  semanas,
  maestros,
  esAdmin = true,
  nombreUsuario = '',
}: {
  semanas: Semana[]
  maestros: MaestroConteo[]
  esAdmin?: boolean
  nombreUsuario?: string
}) {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('semanas')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [mesSeleccionado, setMesSeleccionado] = useState<string>('')

  // Filtrar semanas
  const semanasFiltradas = useMemo(() => {
    return semanas.filter((s) => {
      if (fechaDesde && s.fecha < fechaDesde) return false
      if (fechaHasta && s.fecha > fechaHasta) return false
      if (mesSeleccionado) {
        const fechaSemana = s.fecha.substring(0, 7)
        if (fechaSemana !== mesSeleccionado) return false
      }
      return true
    })
  }, [semanas, fechaDesde, fechaHasta, mesSeleccionado])

  // Generar lista de meses disponibles
  const mesesDisponibles = useMemo(() => {
    const set = new Set<string>()
    semanas.forEach((s) => set.add(s.fecha.substring(0, 7)))
    return Array.from(set).sort().reverse()
  }, [semanas])

  const tituloReporte = useMemo(() => {
    if (mesSeleccionado) {
      const [anio, mes] = mesSeleccionado.split('-')
      const nombreMes = MESES[parseInt(mes) - 1]
      return `Reporte de clases asignadas ${nombreMes} ${anio}`
    }
    return 'Reporte de clases asignadas'
  }, [mesSeleccionado])

  const exportarExcel = () => {
    if (tipoReporte === 'semanas') {
      const headers = [
        'Fecha',
        'Tema',
        'Versículos de estudio',
        'Versículo para memorizar',
        'Manualidad',
        'Actividad de niños pequeños',
        'Maestro principal',
        'Maestro ayudante',
        'Maestro de niños',
      ]
      const filas = semanasFiltradas.map((s) => [
        s.fecha,
        s.tema,
        s.pasaje_biblico || '',
        s.versiculo_memorizar || '',
        s.manualidad || '',
        s.actividad_ninos || '',
        s.principal,
        s.ayudante,
        s.ninos,
      ])
      descargarCSV(headers, filas, 'reporte_semanas')
    } else if (tipoReporte === 'maestros') {
      const headers = ['Maestro', 'Grupo', 'Total de clases']
      const filas = [...maestros]
        .sort((a, b) => a.total - b.total)
        .map((m) => [`${m.nombres} ${m.apellidos}`, m.grupo, m.total])
      descargarCSV(headers, filas, 'reporte_maestros')
    } else {
      const headers = ['Fecha', 'Tema', 'Actividad para niños', 'Maestro de niños']
      const filas = semanasFiltradas
        .filter((s) => s.actividad_ninos)
        .map((s) => [s.fecha, s.tema, s.actividad_ninos || '', s.ninos])
      descargarCSV(headers, filas, 'reporte_actividades_ninos')
    }
  }

  const descargarCSV = (
    headers: string[],
    filas: (string | number)[][],
    nombre: string
  ) => {
    const escapar = (v: string | number) => {
      const str = String(v).replace(/"/g, '""')
      return `"${str}"`
    }
    const lineas = [
      headers.map(escapar).join(','),
      ...filas.map((f) => f.map(escapar).join(',')),
    ]
    const BOM = '\uFEFF'
    const contenido = BOM + lineas.join('\r\n')
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${nombre}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportarPDF = () => window.print()

  return (
    <div>
      <div className="sticky top-0 z-20 bg-gray-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-4 md:pt-8 pb-4 mb-2 border-b border-gray-200 no-print">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              📊 Reportes
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {esAdmin
                ? 'Exporta los datos en PDF o Excel'
                : `Tus clases, ${nombreUsuario}`}
            </p>
          </div>
          <Link
            href="/dashboard/semanas"
            className="text-red-600 hover:underline text-sm"
          >
            ← Volver a semanas
          </Link>
        </div>
      </div>

      {!esAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            ℹ️ Estás viendo <strong>solo tus clases asignadas</strong>. Como
            maestro, este reporte te muestra tu historial personal.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as TipoReporte)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            >
              <option value="semanas">📅 Semanas (clases)</option>
              {esAdmin && (
                <option value="maestros">🧑‍🏫 Maestros (conteo)</option>
              )}
              <option value="ninos">🧒 Actividades de niños</option>
            </select>
          </div>

          {tipoReporte === 'semanas' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por mes
              </label>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Todos los meses</option>
                {mesesDisponibles.map((m) => {
                  const [anio, mes] = m.split('-')
                  return (
                    <option key={m} value={m}>
                      {MESES[parseInt(mes) - 1]} {anio}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {tipoReporte !== 'maestros' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={exportarPDF}
            className="px-4 py-2 rounded-lg text-white font-medium shadow-md hover:shadow-lg flex items-center gap-2"
            style={{ backgroundColor: '#E31E24' }}
          >
            📄 Exportar PDF
          </button>
          <button
            onClick={exportarExcel}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium shadow-md hover:shadow-lg flex items-center gap-2"
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden print-content">
        {/* ENCABEZADO DE IMPRESIÓN */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#E31E24' }}>
            GRACIA IGLESIA CRISTIANA
          </h1>
          <p className="text-base font-semibold text-gray-800 italic mb-1">
            "La Casa de Su Amor y Su Poder"
          </p>
          <p className="text-xs text-gray-700 max-w-2xl mx-auto mt-3">
            <strong>Ministerio de niños:</strong> "Jesús dijo: «Dejen que los
            niños vengan a mí; no se lo impidan, porque el reino de los cielos
            es de quienes son como ellos»" — Mateo 19:14 NVI
          </p>
          <hr className="my-4 border-gray-300" />
          <h2 className="text-xl font-bold text-gray-800">{tituloReporte}</h2>
        </div>

        {tipoReporte === 'semanas' && (
          <>
            <div className="p-4 border-b bg-gray-50 no-print">
              <h2 className="font-semibold text-gray-800">{tituloReporte}</h2>
              <p className="text-xs text-gray-500 mt-1">
                {semanasFiltradas.length} semana
                {semanasFiltradas.length === 1 ? '' : 's'}
                {mesSeleccionado && ` · ${MESES[parseInt(mesSeleccionado.split('-')[1]) - 1]} ${mesSeleccionado.split('-')[0]}`}
                {fechaDesde && ` · desde ${fechaDesde}`}
                {fechaHasta && ` · hasta ${fechaHasta}`}
              </p>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">Fecha</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">Tema</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">Versículos de estudio</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">Versículo para memorizar</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">Manualidad</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">Actividad de niños pequeños</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">🧑‍🏫 Maestro principal</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">🤝 Maestro ayudante</th>
                    <th className="text-left px-3 py-2 text-xs font-semibold text-gray-700">🧒 Maestro de niños</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {semanasFiltradas.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-700 whitespace-nowrap">
                        {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-800">{s.tema}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{s.pasaje_biblico || '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{s.versiculo_memorizar || '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">{s.manualidad || '—'}</td>
                      <td className="px-3 py-2 text-xs text-gray-600">
                        {s.actividad_ninos || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        <span className="font-semibold">🧑‍🏫Principal:</span>{s.principal}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        <span className="font-semibold">🤝Ayudante:</span>{s.ayudante}
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-700">
                        <span className="font-semibold">🧒Niños:</span>{s.ninos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y">
              {semanasFiltradas.map((s) => (
                <div key={s.id} className="p-4">
                  <p className="text-xs text-gray-500">
                    {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-gray-800 mt-1">{s.tema}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-700">
                    <p><span className="font-semibold text-gray-800">Versículos de estudio: </span>{s.pasaje_biblico || '—'}</p>
                    <p><span className="font-semibold text-gray-800">Versículo para memorizar: </span>{s.versiculo_memorizar || '—'}</p>
                    <p><span className="font-semibold text-gray-800">Manualidad: </span>{s.manualidad || '—'}</p>
                    <p><span className="font-semibold text-gray-800">Actividad de niños pequeños: </span>{s.actividad_ninos || '—'}</p>
                    <p><span className="font-semibold text-gray-800">🧑‍🏫 Maestro principal: </span>{s.principal}</p>
                    <p><span className="font-semibold text-gray-800">🤝 Maestro ayudante: </span>{s.ayudante}</p>
                    <p><span className="font-semibold text-gray-800">🧒 Maestro de niños: </span>{s.ninos}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tipoReporte === 'maestros' && esAdmin && (
          <>
            <div className="p-4 border-b bg-gray-50 no-print">
              <h2 className="font-semibold text-gray-800">Reporte de maestros</h2>
              <p className="text-xs text-gray-500 mt-1">{maestros.length} maestro{maestros.length === 1 ? '' : 's'} en total</p>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Maestro</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Grupo</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-700">Total de clases</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[...maestros].sort((a, b) => a.total - b.total).map((m) => (
                  <tr key={`${m.id}-${m.grupo}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{m.nombres} {m.apellidos}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {m.grupo === 'Principal' && '🧑‍🏫 '}
                      {m.grupo === 'Ayudante' && '🤝 '}
                      {m.grupo === 'Niños' && '🧒 '}
                      {m.grupo}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-gray-800">{m.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tipoReporte === 'ninos' && (
          <>
            <div className="p-4 border-b bg-gray-50 no-print">
              <h2 className="font-semibold text-gray-800">🧒 Reporte de actividades de niños pequeños</h2>
              <p className="text-xs text-gray-500 mt-1">
                {semanasFiltradas.filter((s) => s.actividad_ninos).length} semana
                {semanasFiltradas.filter((s) => s.actividad_ninos).length === 1 ? '' : 's'} con actividad registrada
                {fechaDesde && ` desde ${fechaDesde}`}
                {fechaHasta && ` hasta ${fechaHasta}`}
              </p>
            </div>

            {semanasFiltradas.filter((s) => !s.actividad_ninos).length > 0 && (
              <div className="p-4 bg-yellow-50 border-b border-yellow-200 no-print">
                <p className="text-xs text-yellow-800">
                  ⚠️ {semanasFiltradas.filter((s) => !s.actividad_ninos).length} semana
                  {semanasFiltradas.filter((s) => !s.actividad_ninos).length === 1 ? '' : 's'} aún sin actividad registrada.
                </p>
              </div>
            )}

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Tema</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Actividad para niños</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700">Maestro de niños</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {semanasFiltradas.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">
                        {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.tema}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {s.actividad_ninos ? s.actividad_ninos : <span className="text-yellow-600 italic text-xs">Sin registrar</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{s.ninos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y">
              {semanasFiltradas.map((s) => (
                <div key={s.id} className="p-4">
                  <p className="text-xs text-gray-500">
                    {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-gray-800 mt-1">{s.tema}</h3>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-gray-700">
                      <strong>🧒 Actividad:</strong>{' '}
                      {s.actividad_ninos ? s.actividad_ninos : <span className="text-yellow-600 italic">Sin registrar</span>}
                    </p>
                    <p className="text-gray-700"><strong>Maestro:</strong> {s.ninos}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {((tipoReporte === 'semanas' && semanasFiltradas.length === 0) ||
          (tipoReporte === 'maestros' && esAdmin && maestros.length === 0) ||
          (tipoReporte === 'ninos' && semanasFiltradas.filter((s) => s.actividad_ninos).length === 0)) && (
          <div className="p-12 text-center text-gray-500">No hay datos para mostrar con los filtros seleccionados.</div>
        )}
      </div>
    </div>
  )
}
