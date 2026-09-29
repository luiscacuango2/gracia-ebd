import { NextResponse } from 'next/server'

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

Para el tema "${tema}" de una clase de Escuela Bíblica Dominical, sugiere entre 3 y 4 versículos bíblicos apropiados para estudiar en clase.

Responde ÚNICAMENTE con las citas separadas por coma, sin texto adicional, sin comillas, sin numeración.

Ejemplo de respuesta (para el tema "El servicio"):
Mateo 20:26-28, Juan 12:26, Mateo 23:11, Filipenses 2:5-7

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
          mensaje: 'Error al consultar la IA: ' + (errorData.error?.message || response.status),
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    let textoRespuesta = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    textoRespuesta = textoRespuesta
      .replace(/```/g, '')
      .replace(/^\s*\d+\.\s*/gm, '')
      .replace(/^[-•]\s*/gm, '')
      .trim()

    const lineas = textoRespuesta
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)
    const versiculosLimpios = lineas[0] || textoRespuesta

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
