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
  principal: number
  ayudante: number
  ninos: number
  total: number
}

type TipoReporte = 'semanas' | 'maestros' | 'ninos' | 'puntos'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function ReportesCliente({
  semanas,
  maestros,
  esAdmin = true,
  nombreUsuario = '',
  puntosNinos = [],
  rankingNinos = [],
}: {
  semanas: Semana[]
  maestros: MaestroConteo[]
  esAdmin?: boolean
  nombreUsuario?: string
  puntosNinos?: any[]
  rankingNinos?: any[]
}) {
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('semanas')
  // Inicializar fechas al mes actual
  const hoy = new Date()
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]

  const [fechaDesde, setFechaDesde] = useState(primerDiaMes)
  const [fechaHasta, setFechaHasta] = useState(ultimoDiaMes)
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

  // Filtrar puntos por fecha
  const puntosFiltrados = useMemo(() => {
    return puntosNinos.filter((p: any) => {
      const fechaSemana = p.semanas?.fecha
      if (!fechaSemana) return false
      if (fechaDesde && fechaSemana < fechaDesde) return false
      if (fechaHasta && fechaSemana > fechaHasta) return false
      return true
    })
  }, [puntosNinos, fechaDesde, fechaHasta])

  // Resumen de puntos por niño
  const resumenPuntos = useMemo(() => {
    const map = new Map<string, {
      nombres: string
      apellidos: string
      asistencia: number
      comportamiento: number
      versiculo: number
      total: number
    }>()

    puntosFiltrados.forEach((p: any) => {
      const nino = p.ninos
      if (!nino) return
      const key = p.nino_id
      if (!map.has(key)) {
        map.set(key, {
          nombres: nino.nombres,
          apellidos: nino.apellidos,
          asistencia: 0,
          comportamiento: 0,
          versiculo: 0,
          total: 0,
        })
      }
      const r = map.get(key)!
      if (p.asistencia) { r.asistencia++; r.total++ }
      if (p.comportamiento) { r.comportamiento++; r.total++ }
      if (p.versiculo) { r.versiculo++; r.total++ }
    })

    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [puntosFiltrados])

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
      const headers = [
        'Maestro',
        'Principal',
        'Ayudante',
        'Niños',
        'Total',
      ]
      const filas = [...maestros]
        .sort((a, b) =>
          `${a.nombres} ${a.apellidos}`.localeCompare(
            `${b.nombres} ${b.apellidos}`,
            'es'
          )
        )
        .map((m) => [
          `${m.nombres} ${m.apellidos}`,
          m.principal,
          m.ayudante,
          m.ninos,
          m.total,
        ])
      filas.push([
        'TOTALES',
        maestros.reduce((sum, m) => sum + m.principal, 0),
        maestros.reduce((sum, m) => sum + m.ayudante, 0),
        maestros.reduce((sum, m) => sum + m.ninos, 0),
        maestros.reduce((sum, m) => sum + m.total, 0),
      ])
      descargarCSV(headers, filas, 'reporte_maestros')
    } else if (tipoReporte === 'puntos') {
      const headers = ['Niño/a', 'Asistencia', 'Comportamiento', 'Versículo', 'Total Estrellas']
      const filas = resumenPuntos.map((n) => [
        `${n.nombres} ${n.apellidos}`,
        n.asistencia,
        n.comportamiento,
        n.versiculo,
        n.total,
      ])
      filas.push([
        'TOTALES',
        resumenPuntos.reduce((s, n) => s + n.asistencia, 0),
        resumenPuntos.reduce((s, n) => s + n.comportamiento, 0),
        resumenPuntos.reduce((s, n) => s + n.versiculo, 0),
        resumenPuntos.reduce((s, n) => s + n.total, 0),
      ])
      descargarCSV(headers, filas, 'reporte_puntos_ninos')
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
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-900 -mx-4 md:-mx-8 px-4 md:px-8 pt-4 md:pt-8 pb-4 mb-2 border-b border-gray-200 dark:border-gray-700 no-print">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              📊 Reportes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              {esAdmin
                ? 'Exporta los datos en PDF o Excel'
                : `Tus clases, ${nombreUsuario}`}
            </p>
          </div>
          <Link
            href="/dashboard/semanas"
            className="text-red-600 dark:text-red-400 hover:underline text-sm"
          >
            ← Volver a semanas
          </Link>
        </div>
      </div>

      {!esAdmin && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            ℹ️ Estás viendo <strong>solo tus clases asignadas</strong>. Como
            maestro, este reporte te muestra tu historial personal.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value as TipoReporte)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="semanas">📅 Semanas (clases)</option>
              {esAdmin && (
                <option value="maestros">🧑‍🏫 Maestros (conteo)</option>
              )}
              <option value="ninos">🧒 Actividades de niños</option>
              <option value="puntos">⭐ Puntos de Niños</option>
            </select>
          </div>

          {tipoReporte === 'semanas' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filtrar por mes
              </label>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden print-content">
        {/* ENCABEZADO DE IMPRESIÓN */}
        <div className="hidden print:block p-6 border-b text-center">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#E31E24' }}>
            GRACIA IGLESIA CRISTIANA
          </h1>
          <p className="text-base font-semibold text-gray-800 italic mb-1">
            "La Casa de Su Amor y Su Poder"
          </p>
          <p className="text-sm text-gray-700 max-w-2xl mx-auto mt-3">
            <strong>Ministerio de niños:</strong> "Jesús dijo: «Dejen que los
            niños vengan a mí; no se lo impidan, porque el reino de los cielos
            es de quienes son como ellos»" — Mateo 19:14 NVI
          </p>
          <hr className="my-4 border-gray-300" />
          <h2 className="text-xl font-bold text-gray-800">{tituloReporte}</h2>
        </div>

        {tipoReporte === 'semanas' && (
          <>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 no-print">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">{tituloReporte}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {semanasFiltradas.length} semana
                {semanasFiltradas.length === 1 ? '' : 's'}
                {mesSeleccionado && ` · ${MESES[parseInt(mesSeleccionado.split('-')[1]) - 1]} ${mesSeleccionado.split('-')[0]}`}
                {fechaDesde && ` · desde ${fechaDesde}`}
                {fechaHasta && ` · hasta ${fechaHasta}`}
              </p>
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Tema</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Versículos de estudio</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Versículo para memorizar</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Manualidad</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Actividad de niños pequeños</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">🧑‍🏫 Maestro principal</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">🤝 Maestro ayudante</th>
                    <th className="text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300">🧒 Maestro de niños</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {semanasFiltradas.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-100">{s.tema}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{s.pasaje_biblico || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{s.versiculo_memorizar || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">{s.manualidad || '—'}</td>
                      <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                        {s.actividad_ninos || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">🧑‍🏫Principal:</span>{s.principal}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">🤝Ayudante:</span>{s.ayudante}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">🧒Niños:</span>{s.ninos}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y dark:divide-gray-700">
              {semanasFiltradas.map((s) => (
                <div key={s.id} className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mt-1">{s.tema}</h3>
                  <div className="mt-3 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">Versículos de estudio: </span>{s.pasaje_biblico || '—'}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">Versículo para memorizar: </span>{s.versiculo_memorizar || '—'}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">Manualidad: </span>{s.manualidad || '—'}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">Actividad de niños pequeños: </span>{s.actividad_ninos || '—'}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">🧑‍🏫 Maestro principal: </span>{s.principal}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">🤝 Maestro ayudante: </span>{s.ayudante}</p>
                    <p><span className="font-semibold text-gray-800 dark:text-gray-200">🧒 Maestro de niños: </span>{s.ninos}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tipoReporte === 'maestros' && esAdmin && (
          <>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 no-print">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">Reporte de maestros</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {maestros.length} maestro{maestros.length === 1 ? '' : 's'} en total
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Maestro
                    </th>
                    <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      🧑‍🏫 Principal
                    </th>
                    <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      🤝 Ayudante
                    </th>
                    <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      🧒 Niños
                    </th>
                    <th className="text-center px-3 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...maestros]
                    .sort((a, b) =>
                      `${a.nombres} ${a.apellidos}`.localeCompare(
                        `${b.nombres} ${b.apellidos}`,
                        'es'
                      )
                    )
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                          {m.nombres} {m.apellidos}
                        </td>
                        <td className="px-3 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                          {m.principal > 0 ? m.principal : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                          {m.ayudante > 0 ? m.ayudante : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                          {m.ninos > 0 ? m.ninos : <span className="text-gray-300 dark:text-gray-600">—</span>}
                        </td>
                        <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800">
                          {m.total}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="bg-gray-100 dark:bg-gray-700 border-t-2 dark:border-gray-600">
                  <tr>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200">
                      TOTALES
                    </td>
                    <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100">
                      {maestros.reduce((sum, m) => sum + m.principal, 0)}
                    </td>
                    <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100">
                      {maestros.reduce((sum, m) => sum + m.ayudante, 0)}
                    </td>
                    <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100">
                      {maestros.reduce((sum, m) => sum + m.ninos, 0)}
                    </td>
                    <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-600">
                      {maestros.reduce((sum, m) => sum + m.total, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}

        {tipoReporte === 'ninos' && (
          <>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 no-print">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">🧒 Reporte de actividades de niños pequeños</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {semanasFiltradas.filter((s) => s.actividad_ninos).length} semana
                {semanasFiltradas.filter((s) => s.actividad_ninos).length === 1 ? '' : 's'} con actividad registrada
                {fechaDesde && ` desde ${fechaDesde}`}
                {fechaHasta && ` hasta ${fechaHasta}`}
              </p>
            </div>

            {semanasFiltradas.filter((s) => !s.actividad_ninos).length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-700 no-print">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ {semanasFiltradas.filter((s) => !s.actividad_ninos).length} semana
                  {semanasFiltradas.filter((s) => !s.actividad_ninos).length === 1 ? '' : 's'} aún sin actividad registrada.
                </p>
              </div>
            )}

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Tema</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Actividad para niños</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Maestro de niños</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {semanasFiltradas.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">{s.tema}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {s.actividad_ninos ? s.actividad_ninos : <span className="text-yellow-600 dark:text-yellow-400 italic text-sm">Sin registrar</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{s.ninos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden divide-y dark:divide-gray-700">
              {semanasFiltradas.map((s) => (
                <div key={s.id} className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(s.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100 mt-1">{s.tema}</h3>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <strong>🧒 Actividad:</strong>{' '}
                      {s.actividad_ninos ? s.actividad_ninos : <span className="text-yellow-600 dark:text-yellow-400 italic">Sin registrar</span>}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300"><strong>Maestro:</strong> {s.ninos}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tipoReporte === 'puntos' && (
          <>
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700 no-print">
              <h2 className="font-semibold text-gray-800 dark:text-gray-100">⭐ Reporte de Puntos de Niños</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {resumenPuntos.length} niño{resumenPuntos.length === 1 ? '' : 's'} con puntos
                {fechaDesde && ` · desde ${fechaDesde}`}
                {fechaHasta && ` · hasta ${fechaHasta}`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Niño/a</th>
                    <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">✅ Asistencia</th>
                    <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">🤝 Comportamiento</th>
                    <th className="text-center px-3 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300">📖 Versículo</th>
                    <th className="text-center px-3 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700">⭐ Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {resumenPuntos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No hay puntos registrados en este rango de fechas.
                      </td>
                    </tr>
                  ) : (
                    resumenPuntos.map((n, index) => (
                      <tr key={`${n.nombres}-${n.apellidos}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-4 py-3 font-bold text-gray-400">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100">
                          {n.nombres} {n.apellidos}
                        </td>
                        <td className="px-3 py-3 text-sm text-center text-green-600 dark:text-green-400 font-medium">{n.asistencia}</td>
                        <td className="px-3 py-3 text-sm text-center text-blue-600 dark:text-blue-400 font-medium">{n.comportamiento}</td>
                        <td className="px-3 py-3 text-sm text-center text-purple-600 dark:text-purple-400 font-medium">{n.versiculo}</td>
                        <td className="px-3 py-3 text-sm text-center font-black bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">{n.total}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                {resumenPuntos.length > 0 && (
                  <tfoot className="bg-gray-100 dark:bg-gray-700 border-t-2 dark:border-gray-600">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200">TOTALES</td>
                      <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100">{resumenPuntos.reduce((s, n) => s + n.asistencia, 0)}</td>
                      <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100">{resumenPuntos.reduce((s, n) => s + n.comportamiento, 0)}</td>
                      <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100">{resumenPuntos.reduce((s, n) => s + n.versiculo, 0)}</td>
                      <td className="px-3 py-3 text-sm text-center font-bold text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-600">{resumenPuntos.reduce((s, n) => s + n.total, 0)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}

        {((tipoReporte === 'semanas' && semanasFiltradas.length === 0) ||
          (tipoReporte === 'maestros' && esAdmin && maestros.length === 0) ||
          (tipoReporte === 'ninos' && semanasFiltradas.filter((s) => s.actividad_ninos).length === 0) ||
          (tipoReporte === 'puntos' && resumenPuntos.length === 0)) && (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">No hay datos para mostrar con los filtros seleccionados.</div>
          )}

        {(tipoReporte === 'semanas' || tipoReporte === 'ninos') && semanasFiltradas.length > 0 && (
          <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
              Responsabilidades de los maestros:
            </h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>Estar 08:30 a.m. en la iglesia para coordinar la clase con el maestro principal.</li>
              <li>Sacar las sillas y las mesas para la clase.</li>
              <li>Cuidar la casa de niños y no dejar que ingresen a la misma.</li>
              <li>Mantener en orden la casa de niños y cuidar de los materiales existentes.</li>
              <li>Existen materiales en la casa de niños que pueden ser utilizados para las clases.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}