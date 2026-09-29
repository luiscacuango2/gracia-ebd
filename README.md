# Gracia EBD — Sistema de Gestión para Escuela Bíblica Dominical

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.6-black?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Production-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Brevo](https://img.shields.io/badge/Brevo-Email-0B996E?style=for-the-badge&logo=brevo&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp-Integration-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)

![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-success?style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-yes-green.svg?style=for-the-badge)

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
- [Flujo de la Rotación Automática](#-flujo-de-la-rotación-automática)
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

Automatiza la planificación de clases, la asignación de maestros, la rotación equitativa, la comunicación con padres y maestros, y el envío de recordatorios automáticos por correo electrónico.

---

## ✨ Características Principales

### 🔐 Autenticación y Seguridad

- **Login con enlace de acceso (Magic Link)**: Sin contraseñas. Se envía un enlace único y temporal al correo del maestro.
- **Middleware de protección de rutas**: Bloquea el acceso directo a rutas administrativas a usuarios sin permisos.
- **Row Level Security (RLS)** en Supabase: Políticas de seguridad a nivel de base de datos.
- **Tokens públicos con expiración**: Enlaces de edición para maestros con token único por semana.

### 📅 Gestión de Semanas

- **CRUD completo de clases**: Fecha, tema, versículos de estudio, versículo para memorizar, manualidad.
- **Actividad para niños pequeños**: Campo exclusivo para el maestro de párvulos.
- **Filtro de semanas**: Todas / Futuras / Pasadas.
- **Estados visuales**: Badges "Futura" y "Dictada" según la fecha.

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

### 📊 Reportes

- **3 tipos de reporte**: Semanas, Maestros (conteo), Actividades de niños.
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

### 🔄 Historial de Cambios

- **Registro de rotaciones** con motivo, maestro anterior, maestro nuevo, fecha y autor.
- **Opción de borrar todo el historial** (solo admin).

### 🎨 Interfaz

- **Tema personalizado** con colores institucionales (rojo `#E31E24`).
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
| **Despliegue** | Vercel | Hosting, CDN y Cron Jobs |
| **Cron** | Vercel Cron | Recordatorios automáticos diarios |
| **Control de Versiones** | Git + GitHub | Repositorio y control de cambios |

---

## 🏗 Arquitectura del Sistema

### Diagrama General

```text
┌──────────────────────────────────────────────────────────────┐
│                       USUARIOS FINALES                       │
│                                                              │
│   👑 Admin        🧑‍🏫 Maestro Principal     👶 Padres         │
│   🤝 Ayudante     🧒 Maestro de Niños                        │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    VERCEL (Edge Network)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │           Next.js 16 (App Router)                  │      │
│  │                                                    │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │      │
│  │  │  Pages (SSR) │  │   Server     │  │   API    │  │      │
│  │  │  + RSC       │  │   Actions    │  │  Routes  │  │      │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │      │
│  │                                                    │      │
│  │  ┌──────────────┐  ┌──────────────┐                │      │
│  │  │  Middleware  │  │  Cron Jobs   │                │      │
│  │  └──────────────┘  └──────────────┘                │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────┬───────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   SUPABASE   │   │    BREVO     │   │   WHATSAPP   │
│              │   │              │   │              │
│  PostgreSQL  │   │   Emails     │   │  wa.me API   │
│  Auth        │   │   SMTP       │   │  Deep Links  │
│  RLS         │   │   Templates  │   │              │
└──────────────┘   └──────────────┘   └──────────────┘
## 🔐 Flujo de Autenticación

```text
1. Usuario ingresa su correo en /login
2. Server Action genera enlace con Supabase Admin API
3. Brevo envía el correo con el enlace personalizado
4. Usuario hace clic → /auth/callback?code=xxx
5. Next.js intercambia el código por sesión
6. Cookie HttpOnly se guarda automáticamente
7. Middleware valida la sesión en cada petición
8. Usuario accede al dashboard según su rol
```

## 🎲 Flujo de Rotación Automática

```text
1. Admin hace clic en "Generar asignaciones"
2. Sistema carga: semanas futuras, maestros, grupos, restricciones, ausencias
3. Para cada semana futura:
   a. Calcula IDs que sirvieron en las últimas 4 semanas
   b. Para cada rol (principal, ayudante, niños):
      - Nivel 1: Filtra estrictamente (descanso + ausencias + restricciones)
      - Nivel 2: Relaja descanso si no hay suficientes candidatos
      - Nivel 3: Relaja restricciones (último recurso)
      - Ordena por: menos uso → más antigüedad → alfabético
   c. Guarda la asignación en la BD
4. Retorna resumen + detalle semana por semana
```

---

## 🗄 Modelo de Datos

### Diagrama Entidad-Relación

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    maestros     │     │     grupos      │     │ grupo_maestros  │
│─────────────────│     │─────────────────│     │─────────────────│
│ id (PK)         │◄────┤ id (PK)         │     │ grupo_id (FK)   │
│ nombres         │     │ nombre          │     │ maestro_id (FK) │
│ apellidos       │     │ descripcion     │     └─────────────────┘
│ correo (UNIQUE) │     └─────────────────┘              ▲
│ celular         │                                      │
│ fecha_nacimiento│     ┌─────────────────┐              │
│ comida_favorita │     │     semanas     │              │
│ rol (admin|...) │     │─────────────────│              │
│ activo          │     │ id (PK)         │              │
└────────┬────────┘     │ fecha (UNIQUE)  │              │
         │              │ tema            │              │
         │              │ pasaje_biblico  │              │
         │              │ versiculo_memo. │              │
         │              │ manualidad      │              │
         │              │ actividad_ninos │              │
         │              │ token_publico   │              │
         │              └────────┬────────┘              │
         │                       │                       │
         │              ┌────────▼────────┐              │
         │              │  asignaciones   │              │
         │              │─────────────────│              │
         │              │ id (PK)         │              │
         │              │ semana_id (FK)  │              │
         └──────────────┤ maestro_ppal_id │              │
                        │ maestro_ayud_id │              │
                        │ maestro_niños_id│              │
                        └─────────────────┘              │
                                                         │
┌─────────────────┐     ┌─────────────────┐              │
│   rotaciones    │     │ restricciones_  │              │
│─────────────────│     │   maestros      │              │
│ id (PK)         │     │─────────────────│              │
│ semana_id (FK)  │     │ id (PK)         │              │
│ grupo           │     │ maestro_1_id(FK)│──────────────┘
│ maestro_ant_id  │     │ maestro_2_id(FK)│
│ maestro_nuevo_id│     │ motivo          │
│ comentario      │     └─────────────────┘
│ creado_por (FK) │
└─────────────────┘     ┌─────────────────┐
                        │ ausencias_      │
┌─────────────────┐     │   maestros      │
│  logs_correos   │     │─────────────────│
│─────────────────│     │ id (PK)         │
│ id (PK)         │     │ maestro_id (FK) │
│ maestro_id (FK) │     │ fecha_desde     │
│ tipo            │     │ fecha_hasta     │
│ fecha_envio     │     │ motivo          │
└─────────────────┘     └─────────────────┘
```

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

---

## 👤 Roles y Permisos

| Acción | 👑 Admin | 🧑‍🏫 Principal | 🤝 Ayudante | 🧒 Niños |
| :--- | :---: | :---: | :---: | :---: |
| Crear/editar semanas | ✅ | Solo futuras asignadas | ❌ | ❌ |
| Ver semanas | ✅ | ✅ | ✅ | ✅ |
| Asignar maestros | ✅ | ❌ | ❌ | ❌ |
| Anular asignaciones | ✅ | ❌ | ❌ | ❌ |
| Rotación automática | ✅ | ❌ | ❌ | ❌ |
| Gestionar maestros | ✅ | ❌ | ❌ | ❌ |
| Gestionar grupos | ✅ | ❌ | ❌ | ❌ |
| Restricciones/ausencias | ✅ | ❌ | ❌ | ❌ |
| Ver historial de cambios | ✅ | ❌ | ❌ | ❌ |
| Reportes | ✅ (todo) | ✅ (solo suyo) | ✅ (solo suyo) | ✅ (solo suyo) |
| Editar su perfil | ✅ | ✅ | ✅ | ✅ |
| Editar actividad de niños | ✅ | ✅ | ✅ | ✅ |

---

## 🎲 Flujo de la Rotación Automática

### Reglas Aplicadas

1. **🔒 Regla de descanso obligatoria (4 semanas)**: Un maestro que sirvió en la semana N, no puede servir en N+1, N+2, N+3, N+4.
2. **📊 Balanceo por rol**: Se prioriza a quien menos veces ha servido en ese rol.
3. **⏰ Priorización por antigüedad**: Entre empates, se elige a quien hace más tiempo no sirve.
4. **👫 Restricciones de pareja**: Maestros que no pueden servir juntos.
5. **🚫 Ausencias programadas**: No se asigna a maestros ausentes en esa fecha.
6. **🚨 Fallback de 3 niveles**: Garantiza que nunca quede un puesto sin asignar.

### Ejemplo Práctico

**Maestros disponibles:** A, B, C, D, E, F, G, H, I

```text
Semana 1: A (Ppal), B (Ayud), C (Niños)
Semana 2: D (Ppal), E (Ayud), F (Niños)
Semana 3: G (Ppal), H (Ayud), I (Niños)
Semana 4: A (Ppal), B (Ayud), C (Niños)   ← Pueden volver (descansaron 3 semanas)
```

### Sistema de Fallback

| Nivel | Respeta | Cuándo se usa |
| :--- | :--- | :--- |
| **1. Estricto** | Descanso + Ausencias + Restricciones | Siempre que hay suficientes maestros |
| **2. Relajado** | Ausencias + Restricciones | Si no hay suficientes que hayan descansado |
| **3. Último recurso** | Ausencias | Si no hay forma de evitar una restricción |

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
│   │   │       └── perfil/                  # Perfil del usuario
│   │   ├── api/
│   │   │   ├── auth/enviar-enlace/          # API: enviar magic link
│   │   │   ├── cron/recordatorios/          # Cron: correos 1 día antes
│   │   │   └── rotacion-automatica/         # API: generar rotación
│   │   ├── editar/[token]/                  # Edición pública (principal)
│   │   ├── actividad/[token]/               # Edición pública (niños)
│   │   ├── auth/
│   │   │   ├── callback/route.ts            # Callback de Supabase Auth
│   │   │   └── logout/route.ts
│   │   ├── registro/page.tsx                # Registro público de maestros
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── page.tsx
│   ├── components/                          # Componentes reutilizables
│   │   ├── BotonAnularAsignaciones.tsx
│   │   ├── BotonAsignarMaestros.tsx
│   │   ├── BotonEnviarMaestro.tsx
│   │   ├── BotonEnviarRecordatorios.tsx
│   │   ├── BotonWhatsApp.tsx
│   │   ├── ModalAsignarMaestros.tsx
│   │   └── SelectorMaestros.tsx
│   ├── lib/
│   │   ├── saludos.ts                       # Saludos dinámicos por hora
│   │   └── supabase/
│   │       ├── client.ts                    # Cliente de Supabase (navegador)
│   │       └── server.ts                    # Cliente de Supabase (servidor)
│   └── middleware.ts                        # Protección de rutas
├── public/                                  # Assets estáticos
├── vercel.json                              # Configuración de cron
├── next.config.ts                           # Configuración de Next.js
├── tailwind.config.ts                       # Configuración de Tailwind
├── tsconfig.json                            # Configuración de TypeScript
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
3. Configurar las políticas RLS.
4. Obtener `URL` y `anon key` de **Settings → API**.

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

### 🚧 Q1 2027 (En planificación)

- [ ] Vista de calendario mensual para planificación visual
- [ ] Notificaciones push (PWA)
- [ ] Módulo de asistencia de niños por clase
- [ ] Biblioteca de temas reutilizables
- [ ] Backup automático de la base de datos

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

- **Gracia Iglesia Cristiana** por la confianza y el propósito del proyecto.
- **Comunidad Open Source** por las herramientas increíbles que hacen posible este sistema.
- **Vercel, Supabase y Brevo** por sus planes gratuitos que permiten que este proyecto sea **100% sin costo**.

---

<div align="center">

### Hecho con ❤️ para la gloria de Dios

_"Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres"_
**— Colosenses 3:23**

⭐ Si este proyecto te fue útil, dale una estrella en GitHub ⭐

</div>
