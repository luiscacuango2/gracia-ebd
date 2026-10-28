'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="text-center max-w-md">
        <h1 className="text-6xl mb-4">📡</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Sin conexión
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Parece que no tienes internet. Verifica tu conexión y vuelve a intentarlo.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}