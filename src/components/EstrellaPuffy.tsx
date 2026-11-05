export function EstrellaPuffy({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="35.57 34.44 128.86 122.96" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="pBody" gradientUnits="userSpaceOnUse" cx="72" cy="62" r="110">
          <stop offset="0%" stopColor="#F3CD86" />
          <stop offset="55%" stopColor="#E0A84A" />
          <stop offset="100%" stopColor="#C9923E" />
        </radialGradient>
        <radialGradient id="pHl" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff" stopOpacity=".6" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        d="M92.38 42.88 Q100.00 26.00 107.62 42.88 L115.66 60.69 Q121.16 72.88 134.45 74.34 L153.88 76.48 Q172.28 78.51 158.59 90.97 L144.13 104.13 Q134.24 113.12 136.95 126.22 L140.92 145.36 Q144.67 163.49 128.59 154.31 L111.61 144.63 Q100.00 138.00 88.39 144.63 L71.41 154.31 Q55.33 163.49 59.08 145.36 L63.05 126.22 Q65.76 113.12 55.87 104.13 L41.41 90.97 Q27.72 78.51 46.12 76.48 L65.55 74.34 Q78.84 72.88 84.34 60.69 Z"
        fill="url(#pBody)"
      />
      <ellipse cx="78" cy="70" rx="30" ry="20" fill="url(#pHl)" />
      <circle cx="86" cy="106" r="7.5" fill="#4A3428" />
      <circle cx="114" cy="106" r="7.5" fill="#4A3428" />
      <circle cx="88.4" cy="103.6" r="2.4" fill="#fff" opacity=".85" />
      <circle cx="116.4" cy="103.6" r="2.4" fill="#fff" opacity=".85" />
      <ellipse cx="69" cy="120" rx="11" ry="6.5" fill="#F5A8B8" opacity=".8" />
      <ellipse cx="131" cy="120" rx="11" ry="6.5" fill="#F5A8B8" opacity=".8" />
      <path d="M89 125 Q100 137 111 125" fill="none" stroke="#4A3428" strokeWidth="4.2" strokeLinecap="round" />
    </svg>
  )
}

// Estrella vacía (para el tablero)
export function EstrellaMini({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="35.57 34.44 128.86 122.96" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="pBodyMini" gradientUnits="userSpaceOnUse" cx="72" cy="62" r="110">
          <stop offset="0%" stopColor="#F3CD86" />
          <stop offset="55%" stopColor="#E0A84A" />
          <stop offset="100%" stopColor="#C9923E" />
        </radialGradient>
      </defs>
      <path
        d="M92.38 42.88 Q100.00 26.00 107.62 42.88 L115.66 60.69 Q121.16 72.88 134.45 74.34 L153.88 76.48 Q172.28 78.51 158.59 90.97 L144.13 104.13 Q134.24 113.12 136.95 126.22 L140.92 145.36 Q144.67 163.49 128.59 154.31 L111.61 144.63 Q100.00 138.00 88.39 144.63 L71.41 154.31 Q55.33 163.49 59.08 145.36 L63.05 126.22 Q65.76 113.12 55.87 104.13 L41.41 90.97 Q27.72 78.51 46.12 76.48 L65.55 74.34 Q78.84 72.88 84.34 60.69 Z"
        fill="url(#pBodyMini)"
      />
    </svg>
  )
}