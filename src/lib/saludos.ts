// Zona horaria de Ecuador (UTC-5)
export function obtenerSaludoEcuador(): {
  saludo: string
  despedida: string
} {
  const ahora = new Date()
  // Convertir a hora de Ecuador (UTC-5)
  const horaEcuador = new Date(
    ahora.toLocaleString('en-US', { timeZone: 'America/Guayaquil' })
  ).getHours()

  let saludo = ''
  let despedida = ''

  if (horaEcuador >= 5 && horaEcuador < 12) {
    saludo = 'Buenos días'
    despedida = 'un lindo día'
  } else if (horaEcuador >= 12 && horaEcuador < 19) {
    saludo = 'Buenas tardes'
    despedida = 'una linda tarde'
  } else {
    saludo = 'Buenas noches'
    despedida = 'una linda noche'
  }

  return { saludo, despedida }
}
