'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { EstrellaPuffy, EstrellaMini } from '@/components/EstrellaPuffy'

type Punto = {
  asistencia: boolean
  comportamiento: boolean
  versiculo: boolean
  observacion: string | null
  semanas: { fecha: string }[] | { fecha: string } | null
  maestros: { nombres: string } | { nombres: string }[] | null
}

type Premio = {
  fecha_ganado: string
  entregado: boolean // actualiza el tipo para incluir entregado
}

type Nino = {
  id: string
  nombres: string
  apellidos: string
  codigo_secreto: string
  puntos_ninos: Punto[]
  premios_ganados: Premio[]
}

const META = 50

function calcularTotales(nino: Nino) {
  const getFecha = (p: Punto): string | null => {
    if (!p.semanas) return null
    if (Array.isArray(p.semanas)) return p.semanas[0]?.fecha || null
    if (typeof p.semanas === 'object' && 'fecha' in p.semanas) return (p.semanas as any).fecha
    return null
  }

  const getMaestro = (p: Punto): string => {
    if (!p.maestros) return 'Sistema'

    // Si viene como arreglo (lo más común)
    if (Array.isArray(p.maestros)) {
      const m = p.maestros[0]
      return m?.nombres || 'Sistema'
    }

    // Si por alguna razón Supabase lo devuelve como objeto único
    return (p.maestros as any).nombres || 'Sistema'
  }

  // 1. Encontrar la fecha del último premio ENTREGADO
  let fechaUltimoPremio: Date | null = null
  if (nino.premios_ganados && nino.premios_ganados.length > 0) {
    const premiosEntregados = nino.premios_ganados.filter(p => p.entregado === true)
    if (premiosEntregados.length > 0) {
      const fechas = premiosEntregados.map(p => new Date(p.fecha_ganado).getTime())
      fechaUltimoPremio = new Date(Math.max(...fechas))
      // Forzamos a que sea a las 00:00:00 UTC del día para comparar sin horas
      fechaUltimoPremio.setUTCHours(0, 0, 0, 0)
    }
  }

  // 2. Filtrar los puntos
  const puntosValidos = (nino.puntos_ninos || []).filter(p => {
    const fecha = getFecha(p)
    if (!fecha) return false

    if (fechaUltimoPremio) {
      // Comparamos solo las fechas (sin horas)
      const fechaPunto = new Date(fecha + 'T00:00:00Z')
      return fechaPunto.getTime() > fechaUltimoPremio.getTime()
    }
    return true
  })

  // 3. Agrupar por fecha los puntos válidos
  const mapaFechas = new Map<string, { asistencia: number, comportamiento: number, versiculo: number, maestro: string, observacion: string | null }>()

  puntosValidos.forEach(p => {
    const fecha = getFecha(p)!
    if (!mapaFechas.has(fecha)) {
      mapaFechas.set(fecha, {
        asistencia: 0,
        comportamiento: 0,
        versiculo: 0,
        maestro: getMaestro(p),
        observacion: p.observacion
      })
    }
    const reg = mapaFechas.get(fecha)!
    if (Boolean(p.asistencia)) reg.asistencia++
    if (Boolean(p.comportamiento)) reg.comportamiento++
    if (Boolean(p.versiculo)) reg.versiculo++
    if (p.observacion) reg.observacion = p.observacion
  })

  // 4. Calcular totales
  let totalAsistencia = 0, totalComportamiento = 0, totalVersiculo = 0

  const historial = Array.from(mapaFechas.entries())
    .map(([fecha, data]) => {
      const totalDia = data.asistencia + data.comportamiento + data.versiculo
      if (totalDia > 0) {
        totalAsistencia += data.asistencia
        totalComportamiento += data.comportamiento
        totalVersiculo += data.versiculo
      }
      return {
        fecha,
        asistenciaVista: data.asistencia > 0 ? 1 : 0,
        comportamientoVista: data.comportamiento > 0 ? 1 : 0,
        versiculoVista: data.versiculo > 0 ? 1 : 0,
        totalDia,
        maestro: data.maestro,
        observacion: data.observacion
      }
    })
    .filter(item => item.totalDia > 0)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return {
    totalActual: totalAsistencia + totalComportamiento + totalVersiculo,
    asistenciaCiclo: totalAsistencia,
    comportamientoCiclo: totalComportamiento,
    versiculoCiclo: totalVersiculo,
    historial,
  }
}

export default function PuntosPublicos({ ninos }: { ninos: Nino[] }) {
  const [vista, setVista] = useState<'home' | 'maestro' | 'ficha'>('home')
  const [ninoSeleccionado, setNinoSeleccionado] = useState<Nino | null>(null)
  const [animarAnillo, setAnimarAnillo] = useState(false)

  const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [codigo, setCodigo] = useState(['', '', '', ''])
  const [errorCodigo, setErrorCodigo] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const primerInputRef = useRef<HTMLInputElement>(null)
  const [vieneDeMaestro, setVieneDeMaestro] = useState(false)

  // Animación del anillo
  useEffect(() => {
    if (vista === 'ficha') {
      setAnimarAnillo(false)
      const timer = setTimeout(() => setAnimarAnillo(true), 50)
      return () => clearTimeout(timer)
    }
  }, [vista])

  // Auto-focus en el modal
  useEffect(() => {
    if (modalAbierto && primerInputRef.current) {
      setTimeout(() => primerInputRef.current?.focus(), 100)
    }
  }, [modalAbierto])

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const nuevoCodigo = [...codigo]
    nuevoCodigo[index] = value.slice(-1)
    setCodigo(nuevoCodigo)
    if (value && index < 3) {
      document.getElementById(`digit-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      document.getElementById(`digit-${index - 1}`)?.focus()
    }
    if (e.key === 'Enter') {
      validarCodigo()
    }
  }

  const validarCodigo = () => {
    const codigoIngresado = codigo.join('')
    if (codigoIngresado === '7777') {
      setModalAbierto(false)
      setVista('maestro')
      setVieneDeMaestro(true)
      setCodigo(['', '', '', ''])
      setErrorCodigo('')
      return
    }

    const nino = ninos.find(n => n.codigo_secreto === codigoIngresado)
    if (nino) {
      setNinoSeleccionado(nino)
      setModalAbierto(false)
      setVista('ficha')
      setVieneDeMaestro(false)
      setCodigo(['', '', '', ''])
      setErrorCodigo('')
    } else {
      setErrorCodigo('Código incorrecto. Intenta de nuevo.')
      setCodigo(['', '', '', ''])
      document.getElementById('digit-0')?.focus()
    }
  }

  const totalesSeleccionado = useMemo(() => {
    if (!ninoSeleccionado) return null
    return calcularTotales(ninoSeleccionado)
  }, [ninoSeleccionado])

  const ninosFiltrados = useMemo(() => {
    if (!busqueda) return ninos
    const term = busqueda.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return ninos.filter(n => {
      const nombre = `${n.nombres} ${n.apellidos}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return nombre.includes(term) || n.codigo_secreto.includes(term)
    })
  }, [ninos, busqueda])

  return (
    <div className="min-h-screen bg-crema-fondo text-marron font-sans flex justify-center">

      {/* VISTA HOME */}
      {vista === 'home' && (
        <div className="w-full max-w-107.5 min-h-screen flex flex-col justify-center px-6 py-10 relative">
          <div className="relative w-full flex flex-col items-center pt-24.25">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-42.5 z-10 pointer-events-none">
              <div className="relative w-full h-auto animate-[floatStar_3.6s_ease-in-out_infinite]">
                <EstrellaPuffy className="w-full h-auto" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-23.5 h-3.5 bg-marron/15 rounded-full blur-[7px] animate-[floatShadow_3.6s_ease-in-out_infinite]" />

              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute top-2 -right-1.5 w-4.5 h-4.5 animate-[twinkle_2.8s_ease-in-out_infinite]">
                  <svg viewBox="0 0 24 24"><path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" fill="#F3CD86" stroke="#F3CD86" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>
                </div>
                <div className="absolute top-14 -left-2.5 w-3.5 h-3.5 animate-[twinkle_2.8s_ease-in-out_infinite] [animation-delay:0.9s]">
                  <svg viewBox="0 0 24 24"><path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" fill="#B5C99A" stroke="#B5C99A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /></svg>
                </div>
                <div className="absolute -top-0.5 left-4.5 w-2.75 h-2.75 animate-[twinkle_2.8s_ease-in-out_infinite] [animation-delay:1.6s]">
                  <svg viewBox="0 0 24 24"><path d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z" fill="#FFF8EE" stroke="#E8B86D" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" /></svg>
                </div>
              </div>
            </div>

            <div className="w-full bg-linear-to-b from-crema-tarjeta to-crema-card rounded-4xl shadow-[0_16px_40px_rgba(74,52,40,0.1),0_4px_12px_rgba(74,52,40,0.06)] pt-28 pb-7 px-6 flex flex-col items-center relative z-0">
              <h1 className="font-semibold text-[1.55rem] leading-snug text-center mb-7 font-fredoka">
                Gracia, escuelita bíblica infantil
              </h1>
              <button
                onClick={() => setModalAbierto(true)}
                className="w-full min-h-14 px-6 py-4 rounded-[28px] font-extrabold text-[1.05rem] text-[#5A3A28] bg-linear-to-b from-durazno to-durazno-oscuro shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_0_rgba(201,146,62,0.28),0_12px_24px_rgba(74,52,40,0.12)] active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_0_rgba(201,146,62,0.25),0_6px_12px_rgba(74,52,40,0.12)] transition-all duration-150"
              >
                Ingresa el código
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VISTA MAESTRO (LISTA) */}
      {vista === 'maestro' && (
        <div className="w-full max-w-107.5 min-h-screen flex flex-col px-6 py-10">
          <div className="text-center mb-6">
            <span className="inline-block text-[0.74rem] font-extrabold tracking-wider uppercase text-ocre bg-[#FCEBCB] px-3 py-1.5 rounded-full mb-2">Escuelita Gracia</span>
            <h1 className="font-fredoka font-semibold text-[1.9rem] text-marron">Modo maestro</h1>
            <p className="font-bold text-[0.95rem] text-marron-suave">{ninosFiltrados.length} niños</p>
          </div>

          <div className="sticky top-2 z-10 flex items-center gap-3 px-4 min-h-13 rounded-[28px] bg-crema-tarjeta shadow-[0_6px_16px_rgba(74,52,40,0.12),inset_0_0_0_2px_#F3E3CC] mb-4">
            <svg className="w-5 h-5 text-marron-suave" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input
              type="search"
              placeholder="Buscar por nombre o código"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 bg-transparent outline-none font-bold text-base text-marron placeholder-[#B79C88]"
            />
          </div>

          <div className="flex flex-col gap-2.5 mb-6">
            {ninosFiltrados.map(n => {
              const c = calcularTotales(n)
              const pct = Math.min(c.totalActual / META, 1)
              const lleno = c.totalActual >= META
              return (
                <div key={n.id} className="flex items-center gap-3 p-3 rounded-3xl bg-crema-card shadow-[0_6px_14px_rgba(74,52,40,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <div className="relative w-13 h-13 shrink-0">
                    <svg className="w-13 h-13 -rotate-90" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="#F3E3CC" strokeWidth="6" />
                      <circle cx="26" cy="26" r="22" fill="none" stroke={lleno ? '#B5C99A' : '#E8B86D'} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 22} strokeDashoffset={(2 * Math.PI * 22) * (1 - pct)} />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center font-fredoka font-bold text-[1.05rem] ${lleno ? 'text-[#8BA36B]' : 'text-ocre'}`}>{c.totalActual}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <strong className="block font-fredoka font-semibold text-[1.08rem] truncate">{n.nombres} {n.apellidos}</strong>
                    <small className="block text-[0.8rem] font-bold text-marron-suave mt-0.5">{c.totalActual} de {META} estrellas</small>
                    <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-[#FCEBCB] text-[0.78rem] font-extrabold text-marron-suave">
                      Código <b className="font-fredoka text-[1.12rem] tracking-widest text-marron">{n.codigo_secreto}</b>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setNinoSeleccionado(n)
                      setVista('ficha')
                    }}
                    className="shrink-0 font-extrabold text-[0.88rem] text-white px-3.5 py-2.5 rounded-full bg-linear-to-b from-durazno to-durazno-oscuro shadow-[0_4px_10px_rgba(239,165,133,0.4)] active:scale-95 transition-transform"
                  >
                    Ver ficha
                  </button>
                </div>
              )
            })}
            {ninosFiltrados.length === 0 && <p className="text-center font-bold text-marron-suave py-6">No encontramos a nadie con ese nombre.</p>}
          </div>

          <button
            onClick={() => setVista('home')}
            className="w-full min-h-13 px-6 py-3 rounded-[28px] font-extrabold text-marron-suave bg-linear-to-b from-crema-tarjeta to-[#F7EBDB] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(74,52,40,0.08)] active:translate-y-1"
          >
            Salir
          </button>
        </div>
      )}

      {/* VISTA FICHA (DETALLE DEL NIÑO) */}
      {vista === 'ficha' && ninoSeleccionado && totalesSeleccionado && (
        <div className="w-full max-w-107.5 min-h-screen flex flex-col px-6 py-10">
          <div className="flex items-center mb-4">
            {vieneDeMaestro && (
              <button
                onClick={() => setVista('maestro')}
                className="font-extrabold text-[0.9rem] text-marron-suave bg-crema-card px-3.5 py-2 rounded-full shadow-[0_4px_10px_rgba(74,52,40,0.08)] active:scale-95 transition-transform"
              >
                ← Lista
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 mb-4">
            {/* Tarjeta del Anillo Grande */}
            <div className="bg-linear-to-b from-crema-tarjeta to-crema-card rounded-4xl shadow-[0_16px_40px_rgba(74,52,40,0.1),0_4px_12px_rgba(74,52,40,0.06)] p-6 text-center relative">
              <h1 className="font-fredoka font-semibold text-[1.6rem] mb-4 text-marron">{ninoSeleccionado.nombres} {ninoSeleccionado.apellidos}</h1>

              <div className="relative w-49 h-49 mx-auto">
                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 180 180">
                  <defs>
                    <linearGradient id="ringG" gradientUnits="userSpaceOnUse" x1="180" y1="0" x2="0" y2="180">
                      <stop offset="0%" stopColor="#F3CD86" />
                      <stop offset="100%" stopColor="#C9923E" />
                    </linearGradient>
                  </defs>
                  <circle cx="90" cy="90" r="72" fill="none" stroke="#EFE2CF" strokeWidth="20" />
                  <circle cx="90" cy="90" r="64" fill="none" stroke="rgba(74,52,40,0.07)" strokeWidth="4" />

                  <circle cx="90" cy="90" r="72" fill="none" stroke="url(#ringG)" strokeWidth="20" strokeLinecap="round" strokeDasharray={2 * Math.PI * 72} strokeDashoffset={animarAnillo ? (2 * Math.PI * 72) * (1 - Math.min(totalesSeleccionado.totalActual / META, 1)) : 2 * Math.PI * 72} className="transition-all duration-2000 ease-out drop-shadow-[0_2px_2px_rgba(139,105,20,0.25)]" />
                  <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 72} strokeDashoffset={animarAnillo ? (2 * Math.PI * 72) * (1 - Math.min(totalesSeleccionado.totalActual / META, 1)) : 2 * Math.PI * 72} className="transition-all duration-2000 ease-out" />
                </svg>
                <div className="absolute inset-10 rounded-full flex flex-col items-center justify-center bg-radial-gradient(circle_at_40%_30%,_#FFFFFF,_#FFF6E6_75%) shadow-[0_6px_14px_rgba(74,52,40,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <b className="font-fredoka font-bold text-[58px] leading-none text-ocre tracking-tighter">{totalesSeleccionado.totalActual}</b>
                  <span className="font-fredoka font-semibold text-[1.05rem] text-marron-suave">de {META}</span>
                </div>
              </div>

              <p className="mt-2.5 font-bold text-marron-suave text-[0.95rem]">
                {totalesSeleccionado.totalActual >= META ? `¡Meta cumplida! ${totalesSeleccionado.totalActual} estrellas` : `${totalesSeleccionado.totalActual} estrellas · meta ${META}`}
              </p>
            </div>

            {/* Tarjeta del Tablero (Solo totales) */}
            <div className="bg-linear-to-b from-crema-tarjeta to-crema-card rounded-4xl shadow-[0_16px_40px_rgba(74,52,40,0.1),0_4px_12px_rgba(74,52,40,0.06)] p-3.5">
              <div className="grid grid-cols-[1fr_repeat(3,72px)] items-center gap-y-1.5">
                {/* Celda vacía o título de la primera columna */}
                <div className="text-left pl-2.5 font-extrabold text-[0.8rem] text-marron-suave">Domingo</div>

                {/* Cabeceras de las estrellas */}
                {[
                  { label: 'Asistencia', color: 'bg-[#FBE7C4]' },
                  { label: 'Conducta', color: 'bg-[#E3ECD6]' },
                  { label: 'Versículo', color: 'bg-[#FBDCE3]' }
                ].map(c => (
                  <div key={c.label} className="flex flex-col items-center text-center text-[0.72rem] font-extrabold text-marron leading-tight">
                    <span className={`w-8 h-8 rounded-full grid place-items-center mb-1 ${c.color} shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]`}>
                      <EstrellaMini className="w-5 h-5" />
                    </span>
                    {c.label}
                  </div>
                ))}
                <div className="text-left pl-2.5 font-extrabold text-[0.85rem] text-marron-suave">Total</div>
                <div className="text-center font-fredoka font-bold text-[1.15rem] py-1.5 mx-1.5 rounded-[14px] bg-[#FBE7C4] text-ocre">{totalesSeleccionado.asistenciaCiclo}</div>
                <div className="text-center font-fredoka font-bold text-[1.15rem] py-1.5 mx-1.5 rounded-[14px] bg-[#E3ECD6] text-[#8BA36B]">{totalesSeleccionado.comportamientoCiclo}</div>
                <div className="text-center font-fredoka font-bold text-[1.15rem] py-1.5 mx-1.5 rounded-[14px] bg-[#FBDCE3] text-rosa">{totalesSeleccionado.versiculoCiclo}</div>
              </div>

              {/* Botón para abrir el modal de historial */}
              <button
                onClick={() => setModalHistorialAbierto(true)}
                className="w-full mt-4 py-2.5 text-sm font-bold text-ocre bg-[#F3E8D8]/50 hover:bg-[#F3E8D8] rounded-xl transition-colors"
              >
                Mostrar Historial
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (vieneDeMaestro) {
                setVista('maestro')
              } else {
                setVista('home')
              }
            }}
            className="w-full min-h-13 px-6 py-3 rounded-[28px] font-extrabold text-marron-suave bg-linear-to-b from-crema-tarjeta to-[#F7EBDB] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(74,52,40,0.08)] active:translate-y-1"
          >
            Salir
          </button>
        </div>
      )}

      {/* MODAL / BOTTOM SHEET (Código) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-marron/20 animate-in fade-in duration-300" onClick={() => setModalAbierto(false)} />
          <div className="relative w-full max-w-107.5 bg-linear-to-b from-white to-crema-tarjeta rounded-t-4xl p-6 pb-8 shadow-[0_-12px_40px_rgba(74,52,40,0.12)] animate-in slide-in-from-bottom duration-300">
            <div className="w-10 h-1.5 bg-marron/20 rounded-full mx-auto mb-2" />
            <div className="flex justify-end mb-2">
              <button onClick={() => setModalAbierto(false)} className="w-10 h-10 rounded-full bg-[#F0E4D4] flex items-center justify-center font-bold text-marron-suave active:scale-95">✕</button>
            </div>
            <h2 className="font-fredoka font-semibold text-[1.2rem] text-center mb-6">Ingresa el código de tu niño.</h2>
            <div className="flex justify-center gap-3 mb-2">
              {[0, 1, 2, 3].map(i => (
                <input
                  key={i}
                  id={`digit-${i}`}
                  ref={i === 0 ? primerInputRef : null}
                  type="tel"
                  maxLength={1}
                  value={codigo[i]}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-16 h-19 rounded-[20px] bg-linear-to-b from-[#F3E8D8] to-crema-tarjeta text-center font-fredoka font-bold text-[2rem] text-marron shadow-[inset_0_3px_6px_rgba(74,52,40,0.1),inset_0_-1px_0_rgba(255,255,255,0.8)] focus:outline-none focus:ring-4 focus:ring-durazno/50 transition-all"
                />
              ))}
            </div>
            <p className="min-h-[1.4em] text-center text-[0.9rem] font-semibold text-rosa mb-6">
              {errorCodigo}
            </p>
            <button
              onClick={validarCodigo}
              className="w-full min-h-14 rounded-[28px] font-extrabold text-[1.1rem] text-[#5A3A28] bg-linear-to-b from-durazno to-durazno-oscuro shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_0_rgba(201,146,62,0.28),0_12px_24px_rgba(74,52,40,0.12)] active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_3px_0_rgba(201,146,62,0.25),0_6px_12px_rgba(74,52,40,0.12)] transition-all duration-150"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL */}
      {modalHistorialAbierto && ninoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-marron/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setModalHistorialAbierto(false)}
          />

          {/* Contenido del Modal */}
          <div className="relative w-full max-w-md bg-crema-tarjeta rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">

            {/* Header del modal */}
            <div className="flex justify-between items-center p-5 border-b border-[#F3E8D8]">
              <div>
                <h3 className="font-fredoka font-semibold text-xl text-marron">Historial</h3>
                <p className="text-sm text-marron-suave">{ninoSeleccionado.nombres} {ninoSeleccionado.apellidos}</p>
              </div>
              <button
                onClick={() => setModalHistorialAbierto(false)}
                className="w-9 h-9 rounded-full bg-[#F0E4D4] flex items-center justify-center font-bold text-marron-suave hover:bg-[#E5D5C0] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Lista de registros */}
            <div className="p-4 overflow-y-auto flex-1">

              {/* 🆕 Encabezados de las columnas (Asist., Cond., Vers.) */}
              {totalesSeleccionado && totalesSeleccionado.historial.length > 0 && (
                <div className="flex justify-between items-end mb-2 px-3">
                  <div className="w-1/2"></div> {/* Espacio vacío para la fecha */}
                  <div className="flex gap-1.5 shrink-0">
                    <div className="w-9 text-center text-[10px] font-extrabold text-marron-suave uppercase">Asist.</div>
                    <div className="w-9 text-center text-[10px] font-extrabold text-marron-suave uppercase">Cond.</div>
                    <div className="w-9 text-center text-[10px] font-extrabold text-marron-suave uppercase">Vers.</div>
                  </div>
                </div>
              )}

              {totalesSeleccionado && totalesSeleccionado.historial.length === 0 ? (
                <div className="text-center py-10 text-marron-suave">
                  <p className="text-4xl mb-2">📭</p>
                  <p className="font-bold">No hay registros aún</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {totalesSeleccionado && totalesSeleccionado.historial.map((item, idx) => {
                    const fecha = new Date(item.fecha + 'T12:00:00Z')
                    const fCorta = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).replace('.', '')

                    return (
                      <div key={idx} className="bg-white rounded-2xl p-3 shadow-[0_2px_8px_rgba(74,52,40,0.05)] border border-[#F3E8D8] flex flex-col gap-2">

                        <div className="flex items-center justify-between gap-3">

                          {/* Lado izquierdo: Fecha y Estrellas/Maestro pegados */}
                          <div className="flex-1 min-w-0">
                            <p className="font-fredoka font-semibold text-marron capitalize">{fCorta}</p>

                            {/* 🆕 Estrellas y Maestro en la misma línea */}
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <p className="text-xs text-marron-suave font-bold shrink-0">{item.totalDia} estrellas</p>
                              <p className="text-[10px] text-[#B79C88] truncate">Por: {item.maestro}</p>
                            </div>
                          </div>

                          {/* Lado derecho: Íconos de estrellas */}
                          <div className="flex gap-1.5 shrink-0">
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.asistenciaVista ? 'bg-[#FBE7C4]' : 'bg-[#F3E8D8]/30'}`}>
                              {item.asistenciaVista === 1 ? <EstrellaPuffy className="w-6 h-6" /> : <span className="text-gray-300 text-xs">-</span>}
                            </span>
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.comportamientoVista ? 'bg-[#E3ECD6]' : 'bg-[#F3E8D8]/30'}`}>
                              {item.comportamientoVista === 1 ? <EstrellaPuffy className="w-6 h-6" /> : <span className="text-gray-300 text-xs">-</span>}
                            </span>
                            <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.versiculoVista ? 'bg-[#FBDCE3]' : 'bg-[#F3E8D8]/30'}`}>
                              {item.versiculoVista === 1 ? <EstrellaPuffy className="w-6 h-6" /> : <span className="text-gray-300 text-xs">-</span>}
                            </span>
                          </div>
                        </div>

                        {/* Observación (si existe) */}
                        {item.observacion && (
                          <div className="bg-[#FFF9F0] border border-[#F3E8D8] rounded-xl p-2.5 mt-1 flex gap-2 items-start">
                            <span className="text-sm mt-0.5">📝</span>
                            <p className="text-[11px] text-marron-suave leading-relaxed">
                              <strong className="font-bold text-ocre">Nota del maestro:</strong> {item.observacion}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-4 border-t border-[#F3E8D8]">
              <button
                onClick={() => setModalHistorialAbierto(false)}
                className="w-full py-3 rounded-xl font-bold text-marron bg-[#F3E8D8] hover:bg-[#E5D5C0] transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}