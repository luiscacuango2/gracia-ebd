'use client'
import { useState } from 'react'
import { agregarNino, toggleActivoNino, editarNino } from './acciones'

export default function ListaNinos({ ninosIniciales }: { ninosIniciales: any[] }) {
  // --- Formulario de agregar ---
  const [nuevo, setNuevo] = useState({ nombres: '', apellidos: '', codigo_secreto: '' })
  const [mensaje, setMensaje] = useState('')

  async function handleAgregar(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('Guardando...')
    const res = await agregarNino(nuevo)
    setMensaje(res.mensaje)
    if (res.exito) setNuevo({ nombres: '', apellidos: '', codigo_secreto: '' })
  }

  // --- Formulario de edición ---
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ nombres: '', apellidos: '', codigo_secreto: '' })

  const iniciarEdicion = (nino: any) => {
    setEditandoId(nino.id)
    setEditForm({
      nombres: nino.nombres,
      apellidos: nino.apellidos,
      codigo_secreto: nino.codigo_secreto,
    })
    setMensaje('')
  }

  const cancelarEdicion = () => {
    setEditandoId(null)
    setEditForm({ nombres: '', apellidos: '', codigo_secreto: '' })
  }

  async function handleGuardarEdicion(e: React.FormEvent) {
    e.preventDefault()
    if (!editandoId) return
    setMensaje('Guardando cambios...')
    const res = await editarNino(editandoId, editForm)
    setMensaje(res.mensaje)
    if (res.exito) {
      setEditandoId(null)
      setEditForm({ nombres: '', apellidos: '', codigo_secreto: '' })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 🆕 Título con soporte para modo oscuro */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">👶 Gestión de Niños</h1>
      </div>

      {/* Mensaje global */}
      {mensaje && (
        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-900/30">
          {mensaje}
        </p>
      )}

      {/* Formulario de agregar (solo visible si NO estamos editando) */}
      {!editandoId && (
        <form onSubmit={handleAgregar} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Nombres" required
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={nuevo.nombres} onChange={e => setNuevo({ ...nuevo, nombres: e.target.value })}
          />
          <input
            placeholder="Apellidos" required
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={nuevo.apellidos} onChange={e => setNuevo({ ...nuevo, apellidos: e.target.value })}
          />
          <input
            placeholder="Código Secreto" required
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            value={nuevo.codigo_secreto} onChange={e => setNuevo({ ...nuevo, codigo_secreto: e.target.value })}
          />
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium transition-colors">➕ Agregar</button>
        </form>
      )}

      {/* Formulario de edición */}
      {editandoId && (
        <form onSubmit={handleGuardarEdicion} className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-700 p-4 rounded-lg shadow mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            placeholder="Nombres" required
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={editForm.nombres} onChange={e => setEditForm({ ...editForm, nombres: e.target.value })}
          />
          <input
            placeholder="Apellidos" required
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={editForm.apellidos} onChange={e => setEditForm({ ...editForm, apellidos: e.target.value })}
          />
          <input
            placeholder="Código Secreto" required
            className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={editForm.codigo_secreto} onChange={e => setEditForm({ ...editForm, codigo_secreto: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-medium transition-colors">💾 Guardar</button>
            <button type="button" onClick={cancelarEdicion} className="flex-1 bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500 font-medium transition-colors">✖️ Cancelar</button>
          </div>
        </form>
      )}

      {/* Lista */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
            <tr>
              <th className="p-3 font-semibold">Nombre</th>
              <th className="p-3 font-semibold">Código</th>
              <th className="p-3 text-center font-semibold">Estado</th>
              <th className="p-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ninosIniciales.map(n => (
              <tr key={n.id} className={`border-t dark:border-gray-700 ${editandoId === n.id ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} transition-colors`}>
                <td className="p-3 dark:text-gray-200">{n.nombres} {n.apellidos}</td>
                <td className="p-3 font-mono text-sm dark:text-gray-400">{n.codigo_secreto}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActivoNino(n.id, !n.activo)}
                    className={`text-xs px-2 py-1 rounded font-medium transition-colors ${n.activo ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'}`}
                  >
                    {n.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="p-3 text-center">
                  {/* 🆕 Botón de Editar corregido */}
                  <button
                    onClick={() => iniciarEdicion(n)}
                    disabled={!!editandoId}
                    className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 font-medium disabled:opacity-50 transition-colors dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}