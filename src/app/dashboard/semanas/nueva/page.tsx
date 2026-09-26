import SemanaForm from '../form'

export default function NuevaSemanaPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Nueva Semana
      </h1>
      <p className="text-gray-600 mb-8">
        Registra el tema, pasaje, versículo y manualidad de esta clase.
      </p>

      <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <SemanaForm />
      </div>
    </div>
  )
}
