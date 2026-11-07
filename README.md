# Gracia Iglesia Cristiana — Sistema de Gestión para Escuela Bíblica Dominical

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Production-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-Email-0B996E?style=for-the-badge&logo=brevo&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Integration-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)

**Sistema web profesional, 100% gratuito y sin fines de lucro para la gestión integral de la Escuela Bíblica Dominical.**

[🌐 Ver Producción](https://gracia-iglesia-cristiana.vercel.app) · [🐛 Reportar Bug](https://github.com/luiscacuango2/gracia-ebd/issues) · [💡 Solicitar Función](https://github.com/luiscacuango2/gracia-ebd/issues)

</div>

---

## 📖 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Modelo de Datos](#-modelo-de-datos)
- [Roles y Permisos](#-roles-y-permisos)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Variables de Entorno](#-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Roadmap](#-roadmap)
- [Contribución](#-contribución)
- [Licencia](#-licencia)
- [Autor](#-autor)

---

## 📌 Descripción General

**Gracia EBD** es una plataforma web moderna y profesional diseñada específicamente para la **Escuela Bíblica Dominical** de *Gracia Iglesia Cristiana*.

El sistema fue construido con un enfoque en:

- 💰 **Costo cero de infraestructura**: utiliza exclusivamente capas gratuitas de servicios de primer nivel.
- 🎯 **Simplicidad para el usuario final**: maestros sin conocimientos técnicos pueden usarlo.
- 🤖 **Automatización inteligente**: rotación equitativa, recordatorios y comunicación automatizados.
- 📱 **Diseño responsive**: funciona en celular, tablet y computadora.
- 🔒 **Seguridad**: autenticación sin contraseñas, RLS y tokens públicos.
- 📲 **PWA (Progressive Web App)**: se puede instalar en el celular como app nativa.

Automatiza la planificación de clases, la asignación de maestros, la rotación equitativa, la comunicación con padres y maestros, el registro de puntos de niños y el envío de recordatorios automáticos.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad

- **Login con enlace de acceso (Magic Link)**: Sin contraseñas. Se envía un enlace único y temporal al correo del maestro.
- **Middleware (Proxy) de protección de rutas**: Bloquea el acceso directo a rutas administrativas a usuarios sin permisos.
- **Row Level Security (RLS)** en Supabase: Políticas de seguridad a nivel de base de datos.
- **Tokens públicos con expiración**: Enlaces de edición para maestros con token único por semana.
- **Correos de Supabase personalizados**: Todas las plantillas (Magic Link, Recuperación, Verificación, Cambio de correo) tienen el logo y los colores institucionales.

### 📅 Gestión de Semanas

- **CRUD completo de clases**: Fecha, tema, versículos de estudio, versículo para memorizar, manualidad.
- **Actividad para niños pequeños**: Campo exclusivo para el maestro de párvulos.
- **Filtro de semanas**: Todas / Futuras / Pasadas.
- **Estados visuales**: Badges "Futura" y "Dictada" según la fecha.
- **Selector de semana actual**: La semana en curso se marca con un badge "HOY" o "PRÓXIMA".

### 👥 Gestión de Maestros

- **Registro público** vía formulario compartido.
- **Perfil personal**: Cada maestro puede editar su información.
- **Datos completos**: Nombres, apellidos, correo, celular, fecha de nacimiento, comida favorita.
- **Enlace directo a WhatsApp** con código de país auto-detectado.

### 🎯 Asignación de Maestros

- **3 roles por semana**: Principal, Ayudante, Maestro de Niños.
- **Grupos dinámicos**: Cada maestro pertenece a uno o más grupos.
- **Modal de asignación**: Sin nota para primera asignación, con nota obligatoria para modificaciones.
- **Validación de duplicados**: Un maestro no puede estar en 2 roles la misma semana.
- **Anulación en bloque**: Quitar maestros de un rango de fechas sin registrar en historial.

### 🎲 Rotación Automática Inteligente

- **Regla de descanso de 4 semanas**: Un maestro no puede servir en semanas consecutivas.
- **Priorización por antigüedad**: Se asigna primero a quien hace más tiempo no sirve.
- **Balanceo por rol**: Distribución equitativa dentro de cada grupo.
- **Restricciones de pareja**: Maestros que no pueden servir juntos (ej. esposos).
- **Ausencias programadas**: Periodos en que un maestro no está disponible.
- **Sistema de 3 niveles de fallback**: Garantiza que nunca quede un puesto sin asignar.

### ⭐ Sistema de Puntos para Niños

- **3 estrellas semanales**: Asistencia, Comportamiento y Versículo.
- **Registro por maestro**: Solo el maestro principal de la semana o admin puede registrar puntos.
- **Observaciones**: Campo opcional para justificar por qué no se otorgó una estrella, visible en la cartelera pública y en el historial.
- **Ventana pública** (`/puntos`): Los padres pueden consultar los puntos de sus hijos con diseño "soft UI" (colores pastel, estrellas animadas, tipografía Fredoka).
- **Buscador por código secreto**: Cada niño tiene un código único de 4 dígitos (ej. `0303`).
- **QR por niño**: Cada niño tiene un código QR que abre directamente su tarjeta de puntos.
- **Envío por WhatsApp**: Botón para enviar el enlace de puntos al padre con mensaje preformateado.
- **Impresión masiva de QRs**: Página para imprimir los QRs de todos los niños en formato de carnets.
- **Cartelera General**: Vista para maestros y admins con las tarjetas de todos los niños y sus barras de progreso.
- **Historial por niño**: Modal con el desglose semanal de estrellas, ordenado del más reciente al más antiguo, mostrando el nombre del maestro que registró.
- **Racha de asistencias 🔥**: Cálculo de semanas consecutivas de asistencia, comparando contra las fechas de la tabla `semanas` (no se rompe por feriados).
- **Sincronización externa**: Los códigos de 4 dígitos y los totales de estrellas coinciden exactamente con el sistema de la cartelera física externa.
- **Reporte de puntos**: Integrado en el módulo de Reportes con exportación a Excel y PDF.
- **Sistema de premios automáticos**: Cada 50 estrellas se registra un premio pendiente que el admin puede marcar como entregado. Al entregarlo, el contador del niño se reinicia (el ciclo vuelve a 0).

### 📊 Reportes

- **4 tipos de reporte**: Semanas, Maestros (conteo), Actividades de niños y Puntos de niños.
- **Filtros por rango de fechas**.
- **Exportación a PDF** (impresión) y **Excel (CSV)**.
- **Vista diferenciada por rol**: Admin ve todo, maestro ve solo sus clases.

### 📱 Comunicación Automatizada

- **3 tipos de mensajes de WhatsApp**:
  - 👶 Padres de niños (versículo del domingo)
  - 🧑‍🏫 Maestros (elaboración de la clase)
  - 📢 Confirmación (asignación de maestros — solo admin)
- **Saludos dinámicos** según hora de Ecuador (Buenos días / tardes / noches).
- **Correos recordatorios automáticos** (1 día antes) con Brevo.
- **Cron Job diario** en Vercel.

### 📲 PWA (Progressive Web App)

- **Instalable en celulares**: Se puede "Añadir a pantalla de inicio" como app nativa.
- **Service Worker optimizado**: Se ha configurado con `runtimeCaching` para no cachear las respuestas de Supabase (evita datos obsoletos).
- **Pantalla completa**: Sin la barra de URL del navegador.
- **Icono personalizado**: El logo de la iglesia en la pantalla del celular.
- **Página de limpieza temporal**: Ruta `/limpiar-cache` para forzar la actualización del Service Worker en dispositivos con caché antigua.

### 🎁 Sistema de Premios

- **Automático**: El trigger de la BD detecta cuando un niño llega a 50 estrellas.
- **Pendientes / Entregados**: El admin ve los premios pendientes y los marca como entregados.
- **Deshacer entrega**: Botón para devolver un premio a "Pendiente" y borrar la fecha de entrega sin perder el registro de las 50 estrellas.
- **Historial**: Se registra cuándo se ganó y cuándo se entregó.

### 🔄 Historial de Cambios

- **Registro de rotaciones** con motivo, maestro anterior, maestro nuevo, fecha y autor.
- **Opción de borrar todo el historial** (solo admin).

### 🎨 Interfaz

- **Tema personalizado** con colores institucionales (rojo `#E31E24`).
- **Modo oscuro completo**: Todas las pantallas respetan el tema claro/oscuro.
- **Diseño responsive**: Adaptado a móvil, tablet y desktop.
- **Menú lateral colapsable** con modo "solo iconos".
- **Modales emergentes** para acciones críticas.

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16.3.6 (App Router) | Framework React con SSR y Server Components |
| **Lenguaje** | TypeScript 5.x | Tipado fuerte y seguridad en el desarrollo |
| **UI** | Tailwind CSS 4.x | Estilos utilitarios y diseño responsive |
| **Backend** | Server Actions + API Routes | Lógica de servidor sin API separada |
| **Base de Datos** | Supabase (PostgreSQL) | Persistencia, Auth, RLS y Storage |
| **Autenticación** | Supabase Auth | Magic Link (enlace mágico) sin contraseñas |
| **Correos** | Brevo (ex-Sendinblue) | Envío de correos transaccionales |
| **WhatsApp** | `wa.me` (Deep Link API) | Envío de mensajes pre-formateados |
| **QR** | `qrcode` | Generación de códigos QR |
| **PWA** | `@ducanh2912/next-pwa` | Service Worker y manifest |
| **Despliegue** | Vercel | Hosting, CDN y Cron Jobs |
| **Cron** | Vercel Cron | Recordatorios automáticos diarios |
| **Control de Versiones** | Git + GitHub | Repositorio y control de cambios |

---

## 🗄 Modelo de Datos

### Tablas Principales

| Tabla | Descripción |
| :--- | :--- |
| `maestros` | Registro de todos los maestros con rol y datos personales. |
| `semanas` | Cada clase de la EBD con tema, versículos y actividad de niños. |
| `asignaciones` | Relación entre semanas y maestros (3 roles por semana). |
| `grupos` | Categorías: Principales, Ayudantes, Niños pequeños. |
| `grupo_maestros` | Relación N:M entre maestros y grupos. |
| `rotaciones` | Historial de cambios en asignaciones con motivo. |
| `restricciones_maestros` | Parejas que no pueden servir juntas. |
| `ausencias_maestros` | Periodos de ausencia programada. |
| `logs_correos` | Registro de correos enviados. |
| `ninos` | Niños registrados con código secreto de 4 dígitos. |
| `puntos_ninos` | Estrellas semanales (asistencia, comportamiento, versículo, observación). |
| `premios_ganados` | Premios otorgados automáticamente cada 50 estrellas. |

---

## 👤 Roles y Permisos

| Acción | 👑 Admin | 🧑‍🏫 Principal | 🤝 Ayudante | 🧒 Niños |
| :--- | :---: | :---: | :---: | :---: |
| Crear/editar semanas | ✅ | Solo futuras asignadas | ❌ | ❌ |
| Ver semanas | ✅ | ✅ | ✅ | ✅ |
| Asignar maestros | ✅ | ❌ | ❌ | ❌ |
| Rotación automática | ✅ | ❌ | ❌ | ❌ |
| Gestionar maestros | ✅ | ❌ | ❌ | ❌ |
| Gestionar grupos | ✅ | ❌ | ❌ | ❌ |
| Registrar puntos de niños | ✅ | Solo su semana | ❌ | ❌ |
| Ver cartelera general | ✅ | ✅ | ✅ | ✅ |
| Imprimir QRs | ✅ | ✅ | ✅ | ✅ |
| Gestionar niños | ✅ | ❌ | ❌ | ❌ |
| Gestionar premios | ✅ | ❌ | ❌ | ❌ |
| Reportes | ✅ (todo) | ✅ (solo suyo) | ✅ (solo suyo) | ✅ (solo suyo) |
| Editar su perfil | ✅ | ✅ | ✅ | ✅ |

---

## 🧩 Módulos del Sistema

### Módulos Privados (Dashboard)

| Ruta | Descripción | Acceso |
| :--- | :--- | :--- |
| `/dashboard` | Inicio con resumen | Todos |
| `/dashboard/semanas` | Gestión de clases | Todos |
| `/dashboard/puntos` | Registro de estrellas de niños | Maestros y Admin |
| `/dashboard/cartelera` | Vista general de puntos de todos los niños | Maestros y Admin |
| `/dashboard/reportes` | Reportes con 4 tipos y exportación | Todos |
| `/dashboard/maestros` | Gestión de maestros | Solo Admin |
| `/dashboard/grupos` | Grupos de maestros | Solo Admin |
| `/dashboard/ninos` | CRUD de niños | Solo Admin |
| `/dashboard/ninos/imprimir-qr` | Impresión masiva de QRs | Maestros y Admin |
| `/dashboard/premios` | Premios ganados y entregados | Solo Admin |
| `/dashboard/restricciones` | Restricciones y ausencias | Solo Admin |
| `/dashboard/rotacion-automatica` | Algoritmo de rotación | Solo Admin |
| `/dashboard/rotaciones` | Historial de cambios | Solo Admin |
| `/dashboard/perfil` | Perfil personal | Todos |

### Módulos Públicos

| Ruta | Descripción | Acceso |
| :--- | :--- | :--- |
| `/login` | Autenticación con Magic Link | Público |
| `/registro` | Registro de nuevos maestros | Público |
| `/puntos` | Consulta de puntos de niños (buscador + QR + historial) | Público |
| `/editar/[token]` | Edición de clase por token | Público |
| `/actividad/[token]` | Edición de actividad de niños por token | Público |
| `/offline` | Página cuando no hay conexión (PWA) | Público |
| `/limpiar-cache` | Página temporal para limpiar el Service Worker | Público |

---

## 📂 Estructura del Proyecto

```text
gracia-ebd/
├── src/
│   ├── app/
│   │   ├── (auth)/                          # Rutas de autenticación
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/                     # Rutas protegidas
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx               # Layout con menú lateral
│   │   │       ├── page.tsx                 # Inicio (admin | maestro)
│   │   │       ├── semanas/                 # Gestión de semanas
│   │   │       ├── maestros/                # Gestión de maestros
│   │   │       ├── grupos/                  # Grupos de maestros
│   │   │       ├── restricciones/           # Restricciones y ausencias
│   │   │       ├── rotacion-automatica/     # Algoritmo de rotación
│   │   │       ├── rotaciones/              # Historial de cambios
│   │   │       ├── reportes/                # Reportes exportables
│   │   │       ├── puntos/                  # Registro de estrellas
│   │   │       ├── cartelera/               # Cartelera general
│   │   │       ├── ninos/                   # CRUD de niños
│   │   │       │   └── imprimir-qr/         # Impresión masiva de QRs
│   │   │       ├── premios/                 # Premios ganados
│   │   │       └── perfil/                  # Perfil del usuario
│   │   ├── api/
│   │   │   ├── auth/enviar-enlace/          # API: enviar magic link
│   │   │   ├── cron/recordatorios/          # Cron: correos 1 día antes
│   │   │   └── rotacion-automatica/         # API: generar rotación
│   │   ├── editar/[token]/                  # Edición pública (principal)
│   │   ├── actividad/[token]/               # Edición pública (niños)
│   │   ├── puntos/                          # Ventana pública de puntos
│   │   │   ├── page.tsx
│   │   │   └── PuntosPublicos2.tsx          # Componente cliente de la cartelera
│   │   ├── offline/                         # Página offline (PWA)
│   │   │   └── page.tsx
│   │   ├── limpiar-cache/                   # Página temporal de limpieza
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   ├── callback/route.ts
│   │   │   └── logout/route.ts
│   │   ├── registro/page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/
│   │   ├── BotonAnularAsignaciones.tsx
│   │   ├── BotonAsignarMaestros.tsx
│   │   ├── BotonEnviarMaestro.tsx
│   │   ├── BotonEnviarRecordatorios.tsx
│   │   ├── BotonWhatsApp.tsx
│   │   ├── ModalAsignarMaestros.tsx
│   │   ├── SelectorMaestros.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── BotonInstalarPWA.tsx
│   │   └── EstrellaPuffy.tsx                # SVG de las estrellas
│   ├── lib/
│   │   ├── saludos.ts
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── server.ts
│   └── proxy.ts                             # Protección de rutas (antes middleware.ts)
├── public/
│   ├── icon-192.png                         # Icono PWA
│   ├── icon-512.png                         # Icono PWA
│   ├── manifest.json                        # Manifest PWA
│   └── sw.js                                # Service Worker (generado)
├── vercel.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js 20+** ([descargar](https://nodejs.org/))
- **Cuenta de Supabase** ([crear gratis](https://supabase.com/))
- **Cuenta de Brevo** ([crear gratis](https://brevo.com/))
- **Cuenta de Vercel** ([crear gratis](https://vercel.com/))
- **Cuenta de GitHub** ([crear gratis](https://github.com/))

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/luiscacuango2/gracia-ebd.git
cd gracia-ebd
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Configurar Supabase

1. Crear proyecto en [Supabase](https://supabase.com).
2. Ejecutar el script SQL (en el SQL Editor) para crear las tablas:
   - `maestros`, `semanas`, `asignaciones`, `grupos`, `grupo_maestros`
   - `rotaciones`, `restricciones_maestros`, `ausencias_maestros`, `logs_correos`
   - `ninos`, `puntos_ninos`, `premios_ganados`
3. Configurar las políticas RLS.
4. Configurar la función verificar_premio() y su trigger.
5. Personalizar las plantillas de correo (Magic Link, Recuperación, Verificación, Cambio de correo) con el HTML institucional.
6. Obtener `URL` y `anon key` de **Settings → API**.

### Paso 4: Configurar Brevo

1. Crear cuenta en [Brevo](https://brevo.com).
2. Generar una **API Key v3** (empieza con `xkeysib-`).
3. Verificar el correo remitente.

### Paso 5: Configurar Variables de Entorno

```bash
cp .env.example .env.local
# Editar con tus credenciales
```

### Paso 6: Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Paso 7: Compilar para Producción (PWA)

```bash
npm run build
npm run start
```
> **Nota:** La PWA (Service Worker e instalación) solo funciona en modo producción. En `npm run dev` está deshabilitada para no interferir con el desarrollo.

---

## 🔑 Variables de Entorno

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anónima | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de administrador (⚠️ secreta) | `eyJhbG...` |
| `BREVO_API_KEY` | API Key de Brevo | `xkeysib-...` |
| `BREVO_SENDER_EMAIL` | Correo remitente verificado | `noreply@iglesia.org` |
| `CRON_SECRET` | Token secreto para el cron | `gracia_ebd_2026_...` |
| `NEXT_PUBLIC_SITE_URL` | URL pública del sitio | `https://gracia-iglesia-cristiana.vercel.app` |

> ⚠️ **NUNCA** subas `.env.local` a GitHub. Está protegido por `.gitignore`.

---

## 📜 Scripts Disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo en localhost:3000
npm run build     # Compila el proyecto para producción
npm run start     # Inicia el servidor en modo producción
npm run lint      # Ejecuta ESLint para validar código
```

>  **Nota:** El script `build` usa `--webpack` porque la PWA requiere Webpack y no Turbopack.
---

## 🌐 Despliegue en Producción

### Despliegue Automático (Recomendado)

1. **Push a GitHub**: Vercel detecta cambios automáticamente.
2. **Configurar variables de entorno** en Vercel → *Settings → Environment Variables*.
3. **Configurar el Cron Job**: Ya está definido en `vercel.json`.
4. **Actualizar Supabase**:
   - **Site URL**: `https://gracia-iglesia-cristiana.vercel.app`
   - **Redirect URLs**: agregar el dominio de Vercel.

### URL de Producción

🌐 **[https://gracia-iglesia-cristiana.vercel.app](https://gracia-iglesia-cristiana.vercel.app)**

---

## 🗺 Roadmap

### ✅ Q4 2026 (Completado)

- [x] Autenticación con magic link
- [x] Gestión completa de semanas y maestros
- [x] Rotación automática con reglas inteligentes
- [x] Restricciones de pareja y ausencias
- [x] Reportes exportables PDF/Excel
- [x] Correos recordatorios automáticos
- [x] Integración con WhatsApp
- [x] Sistema de puntos para niños (3 estrellas semanales)
- [x] Ventana pública de puntos con buscador por código
- [x] Generación e impresión de QRs por niño
- [x] Envío de enlaces por WhatsApp
- [x] Cartelera general de puntos
- [x] Historial de puntos por niño
- [x] Reporte de puntos en Excel/PDF
- [x] Sistema de premios automáticos (cada 50 estrellas)
- [x] PWA instalable con Service Worker y manifest
- [x] Modo oscuro completo en todas las pantallas

### 🚧 Q1 2027 (En planificación)

- [ ] Notificaciones push (PWA)
- [ ] Notificaciones por correo al ganar premio
- [ ] Vista pública con historial semana a semana
- [ ] Sistema de "racha" (semanas consecutivas)
- [ ] Vista de calendario mensual para planificación visual
- [ ] Biblioteca de temas reutilizables
- [ ] Backup automático de la base de datos
- [ ] Sistema de Alabanza (rotación de músicos, instrumentos, eventos)

### 🔮 Q2 2027 (Futuro)

- [ ] App móvil (React Native)
- [ ] Reportes avanzados con gráficos estadísticos
- [ ] Integración con Google Calendar
- [ ] Modo offline para zonas sin internet
- [ ] Multi-idioma (español, inglés, quichua)

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas contribuir:

1. Haz **fork** del proyecto.
2. Crea una rama para tu feature: `git checkout -b feature/NuevaFuncionalidad`.
3. Haz commit de tus cambios: `git commit -m 'Add: nueva funcionalidad'`.
4. Haz push a la rama: `git push origin feature/NuevaFuncionalidad`.
5. Abre un **Pull Request**.

Para más detalles, consulta nuestra [Guía de Contribución](CONTRIBUTING.md).

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Luis Cacuango**

- 🌐 [GitHub Profile](https://github.com/luiscacuango2)
- 📧 [luigi.man2084@gmail.com](mailto:luigi.man2084@gmail.com)

---

## 🙏 Agradecimientos
- **Dios** porque todo es de Él.
- **Gracia Iglesia Cristiana** por la confianza y el propósito del proyecto.
- **Comunidad Open Source** por las herramientas increíbles que hacen posible este sistema.
- **Vercel, Supabase, Brevo y WhatsApp** por sus planes gratuitos que permiten que este proyecto sea **100% sin costo**.

---

<div align="center">

### Hecho con ❤️ para la gloria de Dios

_"Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres"_
**— Colosenses 3:23**

⭐ Si este proyecto te fue útil, dale una estrella en GitHub ⭐

</div>
