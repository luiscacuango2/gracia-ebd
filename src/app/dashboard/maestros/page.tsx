import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function MaestrosPage() {
  const supabase = await createClient()

  const { data: maestros, error } = await supabase
    .from('maestros')
    .select('*')
    .order('nombres', { ascending: true })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700">Error al cargar maestros: {error.message}</p>
      </div>
    )
  }

  const formatCelular = (celular: string | null) => {
    if (!celular) return null
    // Limpiar cualquier carácter no numérico
    const limpio = celular.replace(/\D/g, '')
    // Si empieza con 0, quitar el 0 y agregar 593 (código de Ecuador)
    if (limpio.startsWith('0')) {
      return `593${limpio.substring(1)}`
    }
    // Si ya tiene código de país (empieza con 593), usarlo directo
    if (limpio.startsWith('593')) {
      return limpio
    }
    // Si no, agregar 593
    return `593${limpio}`
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Maestros</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {maestros?.length ?? 0} maestro{maestros?.length === 1 ? '' : 's'} registrado{maestros?.length === 1 ? '' : 's'}
          </p>
        </div>
        <Link
          href="/registro"
          target="_blank"
          className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 text-center text-sm sm:text-base"
          style={{ backgroundColor: '#E31E24' }}
        >
          + Link de registro
        </Link>
      </div>

      {maestros && maestros.length > 0 ? (
        <>
          {/* Vista TABLA (desktop) */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Correo</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Celular</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">F. Nac.</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Comida favorita</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {maestros.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{m.nombres} {m.apellidos}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{m.correo}</td>
                    <td className="px-4 py-4 text-sm">
                      {m.celular ? (
                        <a
                          href={`https://wa.me/${formatCelular(m.celular)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline inline-flex items-center gap-1"
                        >
                          📱 {m.celular}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{m.fecha_nacimiento || '—'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{m.comida_favorita || '—'}</td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.rol === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {m.rol}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${m.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {m.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-sm">
                      <Link href={`/dashboard/maestros/${m.id}`} className="text-red-600 hover:underline font-medium">Editar</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista TARJETAS (móvil) */}
          <div className="lg:hidden space-y-3">
            {maestros.map((m) => (
              <div key={m.id} className="bg-white rounded-lg shadow p-4 border-l-4" style={{ borderColor: '#E31E24' }}>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-gray-800 truncate">
                      {m.nombres} {m.apellidos}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{m.correo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.rol === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      {m.rol}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t pt-3">
                  <div>
                    <p className="text-gray-400 uppercase font-medium mb-1">Celular</p>
                    {m.celular ? (
                      <a
                        href={`https://wa.me/${formatCelular(m.celular)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline truncate block"
                      >
                        📱 {m.celular}
                      </a>
                    ) : (
                      <p className="text-gray-500">—</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 uppercase font-medium mb-1">F. Nac.</p>
                    <p className="text-gray-700">{m.fecha_nacimiento || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 uppercase font-medium mb-1">Comida favorita</p>
                    <p className="text-gray-700 truncate">{m.comida_favorita || '—'}</p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/maestros/${m.id}`}
                  className="block text-center mt-3 px-4 py-2 rounded-lg border border-red-600 text-red-600 text-sm font-medium hover:bg-red-50"
                >
                  Editar
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">No hay maestros registrados aún.</p>
          <Link href="/registro" className="text-red-600 hover:underline font-medium">
            Compartir el link de registro
          </Link>
        </div>
      )}
    </div>
  )
}
