import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gracia Iglesia Cristiana - EBD',
  description: 'Escuela Bíblica Dominical - Gracia Iglesia Cristiana',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
