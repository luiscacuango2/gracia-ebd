'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Link from 'next/link'

type Nino = {
  id: string
  nombres: string
  apellidos: string
  codigo_secreto: string
}

export default function ImprimirQR({ ninos }: { ninos: Nino[] }) {
  const [qrs, setQrs] = useState<Record<string, string>>({})
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set(ninos.map(n => n.id)))
  const [cargando, setCargando] = useState(true)

  // Generar todos los QRs al cargar
  useEffect(() => {
    const generarTodos = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const nuevosQrs: Record<string, string> = {}

      for (const nino of ninos) {
        const url = `${baseUrl}/puntos?codigo=${nino.codigo_secreto}`
        nuevosQrs[nino.id] = await QRCode.toDataURL(url, {
          width: 250,
          color: { dark: '#000000', light: '#FFFFFF' },
          margin: 1
        })
      }

      setQrs(nuevosQrs)
      setCargando(false)
    }
    generarTodos()
  }, [ninos])

  const toggleSeleccion = (id: string) => {
    const nuevo = new Set(seleccionados)
    if (nuevo.has(id)) nuevo.delete(id)
    else nuevo.add(id)
    setSeleccionados(nuevo)
  }

  const toggleTodos = () => {
    if (seleccionados.size === ninos.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(ninos.map(n => n.id)))
    }
  }

  const imprimir = () => {
    window.print()
  }

  if (cargando) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-300">
        Generando QRs... un momento por favor.
      </div>
    )
  }

  const ninosParaImprimir = ninos.filter(n => seleccionados.has(n.id))

  return (
    <div className="p-4 md:p-8">
      {/* 🆕 Encabezado con el nombre de la página web */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-red-600 tracking-wide uppercase">
          Gracia Iglesia Cristiana
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 font-medium mt-1">
          Puntos - Escuela Bíblica Dominical
        </p>
      </div>

      {/* Controles (no se imprimen) */}
      <div className="print:hidden mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">🖨️ Imprimir QRs de Niños</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Selecciona a los niños que quieres imprimir ({seleccionados.size} de {ninos.length})
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard/puntos"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              ← Volver a Puntos
            </Link>
            <button
              onClick={imprimir}
              disabled={seleccionados.size === 0}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors text-sm font-medium"
            >
              🖨️ Imprimir ({seleccionados.size})
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={toggleTodos} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
            {seleccionados.size === ninos.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ninos.map(n => (
            <label key={n.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={seleccionados.has(n.id)}
                onChange={() => toggleSeleccion(n.id)}
                className="w-4 h-4 accent-red-600"
              />
              <span className="dark:text-gray-200 truncate">{n.nombres} {n.apellidos}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 🆕 URL del sitio web */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          🌐 Visita la página web para ver los puntos:
        </p>
        <a
          href="https://gracia-iglesia-cristiana.vercel.app/puntos"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline break-all"
        >
          https://gracia-iglesia-cristiana.vercel.app/puntos
        </a>
      </div>

      {/* Área de impresión */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        {ninosParaImprimir.map(nino => (
          <div
            key={nino.id}
            className="bg-white border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 flex flex-col items-center text-center break-inside-avoid print:break-inside-avoid print:border-black"
          >
            {/* 🆕 Cambio a "Gracia Niños" */}
            <div className="w-full bg-red-600 text-white rounded px-2 py-1 mb-2">
              <p className="text-xs font-bold uppercase tracking-wider">Gracia Niños</p>
            </div>
            <h3 className="font-bold text-sm text-gray-900 print:text-black mb-1 leading-tight">
              {nino.nombres} {nino.apellidos}
            </h3>
            <img src={qrs[nino.id]} alt={`QR de ${nino.nombres}`} className="w-32 h-32 my-2" />
            <div className="bg-gray-100 print:bg-white border border-gray-300 print:border-black rounded px-2 py-1 w-full">
              <p className="text-[10px] text-gray-600 print:text-black uppercase">Código</p>
              <p className="font-mono font-bold text-sm text-gray-900 print:text-black">{nino.codigo_secreto}</p>
            </div>
            <p className="text-[9px] text-gray-500 print:text-black mt-1 leading-tight">
              Escanea el QR o visita el sitio para ver tus estrellas ⭐
            </p>
          </div>
        ))}
      </div>

      {/* Estilos de impresión */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
            size: A4;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}