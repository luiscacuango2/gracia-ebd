import { NextResponse } from 'next/server'

/**
 * Combina versículos consecutivos del mismo libro/capítulo.
 * Ej: "2 Reyes 6:5, 2 Reyes 6:6" → "2 Reyes 6:5-6"
 */
function combinarVersiculosConsecutivos(texto: string): string {
  // Separar por comas
  const partes = texto
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  // Parsear cada cita: "Libro Cap:Ver" o "Libro Cap:Ver-Ver"
  type Cita = {
    libro: string
    capitulo: number
    versiculoInicio: number
    versiculoFin: number
    original: string
  }

  const citas: Cita[] = []

  for (const parte of partes) {
    // Regex para "Libro Cap:Ver" o "Libro Cap:Ver-Ver" o "Libro Cap:Ver, Libro Cap:Ver2"
    const match = parte.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/)
    if (match) {
      const [, libro, cap, vInicio, vFin] = match
      citas.push({
        libro: libro.trim(),
        capitulo: parseInt(cap),
        versiculoInicio: parseInt(vInicio),
        versiculoFin: vFin ? parseInt(vFin) : parseInt(vInicio),
        original: parte,
      })
    } else {
      // Si no se puede parsear, mantener el original
      citas.push({
        libro: parte,
        capitulo: 0,
        versiculoInicio: 0,
        versiculoFin: 0,
        original: parte,
      })
    }
  }

  // Combinar citas del mismo libro y capítulo donde los versículos son consecutivos
  const resultado: Cita[] = []

  for (const cita of citas) {
    // Buscar si hay una cita anterior del mismo libro y capítulo
    const anterior = resultado.find(
      (r) =>
        r.libro === cita.libro &&
        r.capitulo === cita.capitulo &&
        cita.versiculoInicio === r.versiculoFin + 1
    )

    if (anterior) {
      // Extender el rango del anterior
      anterior.versiculoFin = cita.versiculoFin
    } else {
      // Agregar como nueva cita
      resultado.push({ ...cita })
    }
  }

  // Formatear el resultado
  return resultado
    .map((c) => {
      if (c.capitulo === 0) return c.original // No se pudo parsear
      if (c.versiculoInicio === c.versiculoFin) {
        return `${c.libro} ${c.capitulo}:${c.versiculoInicio}`
      }
      return `${c.libro} ${c.capitulo}:${c.versiculoInicio}-${c.versiculoFin}`
    })
    .join(', ')
}

/**
 * Cuenta cuántos versículos/pasajes hay después de combinar
 */
function contarVersiculos(texto: string): number {
  return texto.split(',').filter((p) => p.trim().length > 0).length
}

export async function POST(request: Request) {
  try {
    const { tema } = await request.json()

    if (!tema || !tema.trim()) {
      return NextResponse.json(
        { exito: false, mensaje: 'El tema es requerido' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { exito: false, mensaje: 'API Key de Gemini no configurada' },
        { status: 500 }
      )
    }

    const prompt = `Eres un asistente experto en teología bíblica y educación cristiana.

Para el tema "${tema}" de una clase de Escuela Bíblica Dominical, elige SOLO los 2 pasajes bíblicos MÁS adecuados y representativos para estudiar el tema en clase.

REGLAS IMPORTANTES:
- Si un pasaje abarca varios versículos consecutivos del mismo capítulo, escríbelo como rango (ej: "Mateo 20:26-28" en lugar de "Mateo 20:26, Mateo 20:27, Mateo 20:28").
- NO repitas versículos del mismo capítulo por separado.
- Deben ser 2 pasajes DISTINTOS y complementarios (preferiblemente de diferentes libros).
- NO uses pasajes consecutivos del mismo capítulo como 2 pasajes separados.

Responde ÚNICAMENTE con los 2 pasajes separados por coma, sin texto adicional, sin comillas, sin numeración.

Ejemplo de respuesta (para el tema "El servicio"):
Mateo 20:26-28, Filipenses 2:5-7

Ejemplo MAL (no hagas esto):
2 Reyes 6:5, 2 Reyes 6:6

Ahora responde para el tema "${tema}":`

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          exito: false,
          mensaje:
            'Error al consultar la IA: ' +
            (errorData.error?.message || response.status),
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    let textoRespuesta: string =
      data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    textoRespuesta = textoRespuesta
      .replace(/```/g, '')
      .replace(/^\s*\d+\.\s*/gm, '')
      .replace(/^[-•]\s*/gm, '')
      .trim()

    const lineas: string[] = textoRespuesta
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)

    let versiculosLimpios: string = lineas[0] || textoRespuesta

    // 🆕 Combinar versículos consecutivos
    versiculosLimpios = combinarVersiculosConsecutivos(versiculosLimpios)

    // 🆕 Si después de combinar queda solo 1 versículo, pedir otro a la IA
    if (contarVersiculos(versiculosLimpios) < 2) {
      const prompt2 = `Para el tema "${tema}" de una clase de Escuela Bíblica Dominical, ya tengo este pasaje bíblico: ${versiculosLimpios}.

Necesito OTRO pasaje bíblico DIFERENTE y complementario (de preferencia de otro libro de la Biblia) que también sea apropiado para el tema.

REGLAS:
- NO repitas el pasaje ya mencionado.
- Si abarca varios versículos consecutivos, usa rango (ej: "Mateo 20:26-28").
- Responde ÚNICAMENTE con la cita, sin texto adicional.

Ejemplo de respuesta:
Filipenses 2:5-7

Ahora responde:`

      const response2 = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt2 }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          },
        }),
      })

      if (response2.ok) {
        const data2 = await response2.json()
        let textoRespuesta2: string =
          data2.candidates?.[0]?.content?.parts?.[0]?.text || ''
        textoRespuesta2 = textoRespuesta2
          .replace(/```/g, '')
          .replace(/^\s*\d+\.\s*/gm, '')
          .replace(/^[-•]\s*/gm, '')
          .trim()
        const lineas2: string[] = textoRespuesta2
          .split('\n')
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0)
        const segundo: string = lineas2[0] || textoRespuesta2

        if (segundo && !versiculosLimpios.includes(segundo)) {
          versiculosLimpios = `${versiculosLimpios}, ${segundo}`
        }
      }
    }

    if (!versiculosLimpios) {
      return NextResponse.json(
        { exito: false, mensaje: 'La IA no devolvió una respuesta válida' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exito: true,
      versiculos_estudio: versiculosLimpios,
    })
  } catch (err: any) {
    return NextResponse.json(
      { exito: false, mensaje: 'Error: ' + err.message },
      { status: 500 }
    )
  }
}
