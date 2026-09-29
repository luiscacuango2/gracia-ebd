import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import BotonWhatsApp from '@/components/BotonWhatsApp'
import BotonAsignarMaestros from '@/components/BotonAsignarMaestros'
import BotonEnviarMaestro from '@/components/BotonEnviarMaestro'
import BotonEnviarRecordatorios from '@/components/BotonEnviarRecordatorios'
import BotonAnularAsignaciones from '@/components/BotonAnularAsignaciones'

export default async function SemanasPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro = 'todas' } = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: yo } = await supabase
    .from('maestros')
    .select('id, rol')
    .eq('correo', user?.email)
    .single()

  const esAdmin = yo?.rol === 'admin'
  const miId = yo?.id

  const { data: semanas, error } = await supabase
    .from('semanas')
    .select('*')
    .order('fecha', { ascending: false })

  const { data: asignaciones } = await supabase
    .from('asignaciones')
    .select('*')

  const { data: maestros } = await supabase
    .from('maestros')
    .select('id, nombres, apellidos, activo')

  const { data: grupos } = await supabase.from('grupos').select('id, nombre')
  const { data: miembros } = await supabase
    .from('grupo_maestros')
    .select('grupo_id, maestro_id')

  const mapaMaestros = new Map((maestros ?? []).map((m) => [m.id, m]))
  const mapaAsignaciones = new Map(
    (asignaciones ?? []).map((a) => [a.semana_id, a])
  )

  const filtroGrupo = (grupoNombre: string) => {
    const grupoId = grupos?.find((g) => g.nombre === grupoNombre)?.id
    if (!grupoId) return []
    const ids = (miembros ?? [])
      .filter((m) => m.grupo_id === grupoId)
      .map((m) => m.maestro_id)
    return ids
      .map((id) => mapaMaestros.get(id))
      .filter(
        (m): m is { id: string; nombres: string; apellidos: string; activo: boolean } =>
          !!m
      )
  }

  const maestrosPrincipales = filtroGrupo('principales')
  const maestrosAyudantes = filtroGrupo('ayudantes')
  const maestrosNinos = filtroGrupo('ninos')

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error al cargar semanas: {error.message}</p>
      </div>
    )
  }

  const hoy = new Date().toISOString().split('T')[0]
  const proximas = semanas?.filter((s) => s.fecha >= hoy) ?? []
  const pasadas = semanas?.filter((s) => s.fecha < hoy) ?? []

  const mostrarFuturas = filtro === 'todas' || filtro === 'futuras'
  const mostrarPasadas = filtro === 'todas' || filtro === 'pasadas'

  return (
    <div>
      {/* Header STICKY compacto */}
      <div className="sticky top-0 z-20 bg-gray-50 -mx-4 md:-mx-8 px-4 md:px-8 pt-3 md:pt-4 pb-3 mb-2 border-b border-gray-200">
        <div className="flex justify-between items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              Semanas
            </h1>
            <span className="text-xs text-gray-500">
              ({semanas?.length ?? 0})
            </span>
            {esAdmin && (
              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {esAdmin && (
              <>
                <BotonAnularAsignaciones />
                <Link
                  href="/dashboard/semanas/nueva"
                  className="px-3 py-1.5 rounded-lg text-white font-medium hover:opacity-90 text-xs"
                  style={{ backgroundColor: '#E31E24' }}
                >
                  + Nueva semana
                </Link>
              </>
            )}
            {!esAdmin && (
              <div className="text-xs text-gray-500 italic px-2 py-1 bg-white rounded-lg border border-gray-200">
                👁 Solo lectura
              </div>
            )}
          </div>
        </div>

        {/* Filtro compacto */}
        <div className="mt-2 flex gap-1.5 flex-wrap">
          <Link
            href="/dashboard/semanas?filtro=todas"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === 'todas'
                ? 'text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={filtro === 'todas' ? { backgroundColor: '#E31E24' } : {}}
          >
            📋 Todas ({semanas?.length ?? 0})
          </Link>
          <Link
            href="/dashboard/semanas?filtro=futuras"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === 'futuras'
                ? 'text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={filtro === 'futuras' ? { backgroundColor: '#E31E24' } : {}}
          >
            📅 Futuras ({proximas.length})
          </Link>
          <Link
            href="/dashboard/semanas?filtro=pasadas"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filtro === 'pasadas'
                ? 'text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            style={filtro === 'pasadas' ? { backgroundColor: '#E31E24' } : {}}
          >
            📖 Pasadas ({pasadas.length})
          </Link>
        </div>
      </div>

      {semanas && semanas.length > 0 ? (
        <div className="space-y-6">
          {mostrarFuturas && proximas.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-2">
                📅 Próximas semanas
              </h2>
              <div className="grid gap-4">
                {proximas.reverse().map((s) => (
                  <SemanaCard
                    key={s.id}
                    semana={s}
                    asignacion={mapaAsignaciones.get(s.id)}
                    mapaMaestros={mapaMaestros}
                    esAdmin={esAdmin}
                    miId={miId}
                    maestrosPrincipales={maestrosPrincipales}
                    maestrosAyudantes={maestrosAyudantes}
                    maestrosNinos={maestrosNinos}
                  />
                ))}
              </div>
            </div>
          )}

          {mostrarPasadas && pasadas.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-2">
                📖 Semanas pasadas
              </h2>
              <div className="grid gap-4">
                {pasadas.map((s) => (
                  <SemanaCard
                    key={s.id}
                    semana={s}
                    asignacion={mapaAsignaciones.get(s.id)}
                    mapaMaestros={mapaMaestros}
                    esAdmin={esAdmin}
                    miId={miId}
                    maestrosPrincipales={maestrosPrincipales}
                    maestrosAyudantes={maestrosAyudantes}
                    maestrosNinos={maestrosNinos}
                    pasada
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No hay semanas registradas aún.</p>
          {esAdmin && (
            <Link
              href="/dashboard/semanas/nueva"
              className="inline-block px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: '#E31E24' }}
            >
              Crear primera semana
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function SemanaCard({
  semana,
  asignacion,
  mapaMaestros,
  esAdmin,
  miId,
  maestrosPrincipales,
  maestrosAyudantes,
  maestrosNinos,
  pasada = false,
}: {
  semana: any
  asignacion: any
  mapaMaestros: Map<string, { nombres: string; apellidos: string }>
  esAdmin: boolean
  miId: string | undefined
  maestrosPrincipales: { id: string; nombres: string; apellidos: string; activo: boolean }[]
  maestrosAyudantes: { id: string; nombres: string; apellidos: string; activo: boolean }[]
  maestrosNinos: { id: string; nombres: string; apellidos: string; activo: boolean }[]
  pasada?: boolean
}) {
  const fecha = new Date(semana.fecha + 'T12:00:00')
  const fechaFormateada = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const hoy = new Date().toISOString().split('T')[0]
  const esFutura = semana.fecha >= hoy

  const esPrincipal = asignacion?.maestro_principal_id === miId
  const puedeEditar = esAdmin || (esPrincipal && esFutura)

  const maestro = (id: string | null | undefined) => {
    if (!id) return null
    return mapaMaestros.get(id) || null
  }

  const principal = maestro(asignacion?.maestro_principal_id)
  const ayudante = maestro(asignacion?.maestro_ayudante_id)
  const ninos = maestro(asignacion?.maestro_ninos_id)

  const tieneAsignaciones = principal || ayudante || ninos

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 ${
        pasada ? 'opacity-90' : ''
      }`}
      style={{ borderColor: '#E31E24' }}
    >
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="text-xs uppercase text-gray-500 font-medium">
              {fechaFormateada}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                esFutura
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {esFutura ? 'Futura' : 'Dictada'}
            </span>
            {esPrincipal && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800">
                🧑‍🏫 Eres principal
              </span>
            )}
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mt-1 break-words">
            {semana.tema}
          </h3>
        </div>
        <Link
          href={`/dashboard/semanas/${semana.id}`}
          className={`font-medium text-sm whitespace-nowrap ${
            puedeEditar
              ? 'text-red-600 hover:underline'
              : 'text-gray-500 hover:underline'
          }`}
        >
          {puedeEditar ? '✏️ Editar' : '👁 Ver'}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4">
        <div>
          <p className="text-xs uppercase text-gray-400 font-medium mb-1">
            Versículos de estudio
          </p>
          <p className="text-gray-700">{semana.pasaje_biblico || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 font-medium mb-1">
            Versículo para memorizar
          </p>
          <p className="text-gray-700">{semana.versiculo_memorizar || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-400 font-medium mb-1">
            Manualidad
          </p>
          <p className="text-gray-700">{semana.manualidad || '—'}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs uppercase text-yellow-700 font-medium mb-1">
            🧒 Actividad para niños pequeños
          </p>
          <p className="text-gray-700 text-sm">
            {semana.actividad_ninos || (
              <span className="text-gray-400 italic text-xs">Sin registrar</span>
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {tieneAsignaciones ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-base">🧑‍🏫</span>
              <div className="min-w-0">
                <p className="text-xs uppercase text-gray-400 font-medium">Principal</p>
                <p className="text-gray-700 font-medium truncate">
                  {principal ? `${principal.nombres} ${principal.apellidos}` : 'Sin asignar'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">🤝</span>
              <div className="min-w-0">
                <p className="text-xs uppercase text-gray-400 font-medium">Ayudante</p>
                <p className="text-gray-700 font-medium truncate">
                  {ayudante ? `${ayudante.nombres} ${ayudante.apellidos}` : 'Sin asignar'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-base">🧒</span>
              <div className="min-w-0">
                <p className="text-xs uppercase text-gray-400 font-medium">Niños</p>
                <p className="text-gray-700 font-medium truncate">
                  {ninos ? `${ninos.nombres} ${ninos.apellidos}` : 'Sin asignar'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">Sin maestros asignados aún</p>
        )}
      </div>

      {esAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <BotonAsignarMaestros
            semanaId={semana.id}
            semanaTema={semana.tema}
            semanaFecha={semana.fecha}
            maestrosPrincipales={maestrosPrincipales}
            maestrosAyudantes={maestrosAyudantes}
            maestrosNinos={maestrosNinos}
            asignacionActual={{
              principal: asignacion?.maestro_principal_id || '',
              ayudante: asignacion?.maestro_ayudante_id || '',
              ninos: asignacion?.maestro_ninos_id || '',
            }}
          />
        </div>
      )}

      {esAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <BotonEnviarMaestro
            semanaId={semana.id}
            semanaTema={semana.tema}
            semanaFecha={semana.fecha}
            tokenActual={semana.token_publico}
            esAdmin={esAdmin}
            tienePrincipal={!!asignacion?.maestro_principal_id}
            tieneNinos={!!asignacion?.maestro_ninos_id}
          />
          <BotonEnviarRecordatorios
            semanaId={semana.id}
            semanaTema={semana.tema}
            semanaFecha={semana.fecha}
            tienePrincipal={!!asignacion?.maestro_principal_id}
            tieneNinos={!!asignacion?.maestro_ninos_id}
          />
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs uppercase text-gray-400 font-medium mb-2">
          Mensajes para compartir
        </p>
        <BotonWhatsApp
          semana={{
            fecha: semana.fecha,
            tema: semana.tema,
            pasaje_biblico: semana.pasaje_biblico,
            versiculo_memorizar: semana.versiculo_memorizar,
            manualidad: semana.manualidad,
            actividad_ninos: semana.actividad_ninos,
          }}
          esAdmin={esAdmin}
          asignacion={{
            principal: principal ? { nombres: principal.nombres, apellidos: principal.apellidos } : null,
            ayudante: ayudante ? { nombres: ayudante.nombres, apellidos: ayudante.apellidos } : null,
            ninos: ninos ? { nombres: ninos.nombres, apellidos: ninos.apellidos } : null,
          }}
        />
      </div>
    </div>
  )
}
