'use client'

import { useState } from 'react'
import QRCode from 'qrcode'

export function BotonQR({ codigoSecreto, nombreNino }: { codigoSecreto: string, nombreNino: string }) {
  const [qrUrl, setQrUrl] = useState('')
  const [urlDestino, setUrlDestino] = useState('')

  const getBaseUrl = () => {
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  }

  const generarQR = async () => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/puntos?codigo=${codigoSecreto}`
    
    setUrlDestino(url)
    
    const dataUrl = await QRCode.toDataURL(url, {
      width: 300,
      color: { dark: '#E31E24', light: '#FFFFFF' },
      margin: 2
    })
    setQrUrl(dataUrl)
  }

  const verPuntos = () => {
    const baseUrl = getBaseUrl()
    window.open(`${baseUrl}/puntos?codigo=${codigoSecreto}`, '_blank')
  }

  // 🆕 Función para enviar por WhatsApp
  const enviarWhatsApp = () => {
    const baseUrl = getBaseUrl()
    const url = `${baseUrl}/puntos?codigo=${codigoSecreto}`
    
    // Texto preformateado del mensaje
    const mensaje = `¡Hola! 👋 Te comparto el enlace para que *${nombreNino}* pueda ver sus estrellas de la Escuela Bíblica Dominical. ⭐\n\n👉 ${url}\n\n¡Dios te bendiga! 🙏`
    
    // Codificamos el mensaje para que sea válido en la URL
    const mensajeCodificado = encodeURIComponent(mensaje)
    
    // Abrimos WhatsApp (funciona en web y móvil). Sin número de teléfono específico, permite elegir el contacto.
    window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank')
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {/* Botón de Ver Puntos */}
      <button 
        onClick={verPuntos} 
        className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors"
        title="Ver los puntos en una nueva ventana"
      >
        👁️ Ver
      </button>

      {/* 🆕 Botón de WhatsApp */}
      <button 
        onClick={enviarWhatsApp} 
        className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 transition-colors"
        title="Enviar enlace por WhatsApp"
      >
        💬 Enviar
      </button>

      {/* Botón de Generar QR */}
      <button 
        onClick={generarQR} 
        className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 transition-colors"
      >
        📱 QR
      </button>
      
      {/* Modal del QR */}
      {qrUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => { setQrUrl(''); setUrlDestino('') }}>
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-center text-gray-900">QR de {nombreNino}</h3>
            <img src={qrUrl} alt="QR" className="w-64 h-64" />
            
            <p className="text-xs text-gray-400 mt-2 mb-4 break-all text-center px-2">
              {urlDestino}
            </p>
            
            <div className="flex gap-2">
              <a 
                href={qrUrl} 
                download={`QR-${nombreNino}.png`} 
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Descargar
              </a>
              <button 
                onClick={() => { setQrUrl(''); setUrlDestino('') }} 
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium"
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