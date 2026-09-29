# Guía de Contribución — Gracia EBD

¡Gracias por tu interés en contribuir al sistema de gestión de la **Escuela Bíblica Dominical de Gracia Iglesia Cristiana**! Este proyecto se rige por altos estándares de calidad de código, una arquitectura serverless eficiente y un enfoque **100% gratuito y sin fines de lucro**.

Para mantener la integridad y calidad del sistema, te pedimos seguir estas directrices.

---

## 📖 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Flujo de Trabajo (Workflow)](#-flujo-de-trabajo-workflow)
- [Convenciones de Código](#-convenciones-de-código)
- [Convenciones de Commits](#-convenciones-de-commits)
- [Modificaciones en la Base de Datos](#-modificaciones-en-la-base-de-datos)
- [Modificaciones en Autenticación](#-modificaciones-en-autenticación)
- [Pruebas y QA](#-pruebas-y-qa)
- [Pull Requests](#-pull-requests)
- [Reportar Bugs](#-reportar-bugs)
- [Sugerir Funcionalidades](#-sugerir-funcionalidades)
- [Recursos Útiles](#-recursos-útiles)

---

## 🤝 Código de Conducta

Al participar en este proyecto, te comprometes a mantener un entorno **profesional, respetuoso y colaborativo**. Este es un proyecto con propósito ministerial y educativo, por lo que esperamos que todas las interacciones reflejen los valores de la comunidad:

- **Respeto mutuo**: Acepta críticas constructivas.
- **Colaboración**: Ayuda a otros contribuidores.
- **Integridad**: No introduzcas código malicioso o inseguro.
- **Tolerancia cero** al acoso o comportamiento inapropiado.

---

## 🔄 Flujo de Trabajo (Workflow)

### 1. Fork del Proyecto

Crea una copia del repositorio en tu cuenta de GitHub haciendo clic en el botón **Fork**.

### 2. Clonar tu Fork

```bash
git clone https://github.com/TU-USUARIO/gracia-ebd.git
cd gracia-ebd
## 🔄 Flujo de Trabajo (Workflow)

### 3. Configurar el Remote Upstream

```bash
git remote add upstream https://github.com/luiscacuango2/gracia-ebd.git
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Crear una Rama para tu Contribución

Usa nombres descriptivos según el tipo de cambio:

```bash
# Para nueva funcionalidad
git checkout -b feature/nueva-funcionalidad

# Para corrección de bugs
git checkout -b fix/correccion-error

# Para documentación
git checkout -b docs/mejora-readme

# Para refactorización
git checkout -b refactor/mejora-rotacion
```

### 6. Desarrollo

Realiza tus cambios siguiendo las **Convenciones de Código**.

### 7. Pruebas Locales

Asegúrate de que todo funciona correctamente antes de subir:

```bash
# Verifica que el código compila
npm run build

# Ejecuta el linter
npm run lint

# Prueba en el navegador
npm run dev
```

### 8. Commit y Push

```bash
git add -A
git commit -m "feat: descripción breve del cambio"
git push origin feature/nueva-funcionalidad
```

### 9. Abrir un Pull Request

Ve a GitHub y haz clic en **"Compare & pull request"**. Llena la plantilla con:

- **Descripción**: ¿Qué hace tu cambio?
- **Motivación**: ¿Por qué es necesario?
- **Capturas**: Si es un cambio visual, incluye screenshots.
- **Testing**: ¿Cómo lo probaste?

---

## 📐 Convenciones de Código

### 1. Estándares de TypeScript / JavaScript

- **Guía de estilo**: Seguimos la **Airbnb JavaScript Style Guide**.
- **Tipado fuerte**: Todo el código debe estar tipado (evitar `any` cuando sea posible).
- **Nombres descriptivos**: En inglés, usando `camelCase` para variables y funciones, `PascalCase` para componentes.
- **Componentes React**: Usar **functional components** con hooks (nunca clases).
- **Server vs Client Components**: Marca claramente con `'use client'` solo cuando sea necesario.

**Ejemplo:**

```typescript
// ✅ Bien
interface MaestroData {
  id: string
  nombres: string
  apellidos: string
}

export async function obtenerMaestro(id: string): Promise<MaestroData> {
  const { data, error } = await supabase
    .from('maestros')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// ❌ Mal
export async function getData(id: any) {
  const data = await supabase.from('maestros').select('*').eq('id', id).single()
  return data
}
```

### 2. Estándares de React / Next.js

- **Server Components por defecto**: Solo usar `'use client'` cuando se requiera interactividad o hooks.
- **Server Actions**: Para mutaciones de datos (insert, update, delete).
- **API Routes**: Solo para webhooks o endpoints externos (como el cron).
- **Naming de archivos**:
  - Componentes: `PascalCase.tsx` (ej: `BotonEnviarMaestro.tsx`)
  - Utilidades: `camelCase.ts` (ej: `saludos.ts`)
  - Rutas: `kebab-case` (ej: `rotacion-automatica/page.tsx`)

### 3. Estilos con Tailwind CSS

- **Mobile-first**: Diseña primero para móvil, luego adapta con `sm:`, `md:`, `lg:`.
- **Colores del tema**: Usar `#E31E24` para el rojo institucional.
- **Clases utilitarias**: Evitar CSS en archivos separados, usar Tailwind directamente.
- **Responsive**: Siempre verificar en móvil, tablet y desktop.

**Ejemplo:**

```tsx
// ✅ Bien
<button className="w-full sm:w-auto px-4 py-2 rounded-lg text-white font-medium hover:opacity-90" style={{ backgroundColor: '#E31E24' }}>
  Enviar
</button>

// ❌ Mal
<button style={{ width: '100%', padding: '8px 16px', backgroundColor: 'red' }}>
  Enviar
</button>
```

### 4. Seguridad

- **NUNCA** exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente.
- **NUNCA** subir `.env.local` a GitHub.
- **NUNCA** exponer datos sensibles en logs de producción.
- **SIEMPRE** validar inputs en el servidor (Server Actions / API Routes).
- **SIEMPRE** usar RLS en Supabase para proteger datos.
- **SIEMPRE** verificar el rol del usuario antes de operaciones críticas.

**Ejemplo de validación de admin:**

```typescript
const { data: { user } } = await supabase.auth.getUser()
const { data: yo } = await supabase
  .from('maestros')
  .select('rol')
  .eq('correo', user?.email)
  .single()

if (yo?.rol !== 'admin') {
  return { exito: false, mensaje: 'Solo administradores' }
}
```

---

## 📝 Convenciones de Commits

Usamos **Conventional Commits** para mantener un historial limpio y facilitar la generación de changelogs.

### Formato

```text
<tipo>(<alcance opcional>): <descripción corta>

<cuerpo opcional>

<footer opcional>
```

### Tipos Permitidos

| Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `feat` | Nueva funcionalidad | `feat: agregar rotación automática` |
| `fix` | Corrección de bug | `fix: corregir duplicados en asignación` |
| `docs` | Cambios en documentación | `docs: actualizar README con arquitectura` |
| `style` | Formato (no afecta lógica) | `style: formatear código con Prettier` |
| `refactor` | Refactorización (sin cambio funcional) | `refactor: simplificar algoritmo de rotación` |
| `test` | Añadir o modificar pruebas | `test: agregar tests para anular asignaciones` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `perf` | Mejoras de rendimiento | `perf: optimizar consulta de semanas` |

### Ejemplos Buenos

```bash
git commit -m "feat(reportes): agregar exportación a Excel"
git commit -m "fix(rotación): corregir descanso de 4 semanas"
git commit -m "docs(readme): agregar diagrama de arquitectura"
git commit -m "refactor(auth): simplificar validación de admin"
```

### Ejemplos Malos

```bash
git commit -m "cambios"                    # ❌ Muy vago
git commit -m "arreglé cosas"              # ❌ Sin tipo
git commit -m "Feat: Nueva funcionalidad"  # ❌ Mayúscula en tipo
git commit -m "feat: a"                    # ❌ Descripción vacía
```

---

## 🗄 Modificaciones en la Base de Datos

Si tu contribución incluye cambios en el esquema de Supabase (PostgreSQL):

### 1. Crea un archivo SQL

Ubicación: `src/db/migrations/YYYYMMDD_descripcion.sql`

**Ejemplo:** `src/db/migrations/20261015_agregar_telefono_maestros.sql`

```sql
-- Migration: agregar campo teléfono a maestros
-- Date: 2026-10-15
-- Author: Nombre del contribuidor

ALTER TABLE maestros ADD COLUMN telefono TEXT;

-- Índice para búsquedas rápidas
CREATE INDEX idx_maestros_telefono ON maestros(telefono);

-- Rollback (documentar cómo revertir)
-- ALTER TABLE maestros DROP COLUMN telefono;
```

### 2. Reglas Importantes

- **SIEMPRE** incluir el script de rollback en comentarios.
- **SIEMPRE** actualizar las políticas RLS si es necesario.
- **NUNCA** eliminar columnas sin antes migrar datos.
- **NUNCA** modificar tablas de producción directamente desde el dashboard.
- **PROBAR** el script en un entorno de desarrollo antes de enviarlo.

### 3. Actualizar los tipos

Si agregas/modificas columnas, actualiza los tipos TypeScript en los archivos relevantes.

---

## 🔐 Modificaciones en Autenticación

La autenticación es crítica. Cualquier cambio debe seguir estas reglas:

### 1. Magic Link

- **NO** cambiar el flujo de generación del enlace sin consultar primero.
- **SIEMPRE** mantener la expiración de 1 hora.
- **NUNCA** usar contraseñas (mantener el flujo sin password).

### 2. Middleware

Si modificas `src/middleware.ts`, asegúrate de:

- **Mantener** la protección de rutas admin.
- **Probar** con diferentes roles (admin, maestro, sin sesión).
- **Verificar** que `/dashboard/reportes` siga accesible para maestros.

### 3. Row Level Security (RLS)

Todas las políticas RLS deben:

- **Ser documentadas** en el commit.
- **Ser probadas** con diferentes roles.
- **No permitir** acceso anónimo a datos sensibles.

---

## 🧪 Pruebas y QA

Antes de enviar un Pull Request, verifica:

### 1. Compilación

```bash
npm run build
```

Debe terminar con `✓ Compiled successfully` y sin errores de TypeScript.

### 2. Linter

```bash
npm run lint
```

No debe haber errores de ESLint.

### 3. Pruebas Manuales

- [ ] Login con magic link funciona.
- [ ] Crear/editar/eliminar semanas funciona.
- [ ] Asignación de maestros funciona.
- [ ] Rotación automática funciona.
- [ ] Restricciones y ausencias se aplican.
- [ ] Reportes exportan correctamente.
- [ ] Los correos llegan con el formato correcto.
- [ ] Los mensajes de WhatsApp funcionan.
- [ ] La aplicación se ve bien en móvil.
- [ ] Los permisos por rol se respetan.

### 4. Pruebas con Diferentes Roles

Crea usuarios de prueba con cada rol y verifica:

- **Admin**: Acceso total.
- **Maestro Principal**: Puede editar sus clases futuras.
- **Maestro Ayudante**: Solo lectura.
- **Maestro de Niños**: Puede editar actividad de niños.

---

## 🎯 Pull Requests

### Título

Usa el mismo formato que los commits:

```text
feat(reportes): agregar filtro por maestro
fix(rotación): corregir balanceo de grupos
docs: actualizar CONTRIBUTING.md
```

### Descripción

Incluye:

```markdown
## 📝 Descripción
Breve descripción de qué hace este PR.

## 🎯 Motivación
¿Por qué es necesario este cambio?

## 🔧 Cambios realizados
- Cambio 1
- Cambio 2

## 📸 Capturas (si aplica)
Antes / Después

## ✅ Checklist
- [ ] El código compila sin errores
- [ ] El linter no reporta problemas
- [ ] Probé los cambios en local
- [ ] Probé con diferentes roles
- [ ] Actualicé la documentación si es necesario
- [ ] No incluí credenciales o datos sensibles

## 🔗 Issues relacionados
Fixes #123
```

### Revisión

- **Mantén el PR enfocado**: Un PR = una funcionalidad.
- **Responde a comentarios** en menos de 48 horas.
- **Actualiza** si hay cambios solicitados.
- **No hagas merge** tú mismo (será revisado primero).

---

## 🐛 Reportar Bugs

Antes de reportar, verifica que:

1. **No exista** un issue similar ya abierto.
2. **Estés en la última versión** del código.
3. **Hayas probado** en modo incógnito (para descartar caché).

### Plantilla de Bug Report

```markdown
## 🐛 Descripción del Bug
Descripción clara y concisa del problema.

## 🔄 Pasos para reproducir
1. Ir a '...'
2. Hacer clic en '...'
3. Ver el error

## ✅ Comportamiento esperado
¿Qué debería pasar?

## ❌ Comportamiento actual
¿Qué pasa en realidad?

## 📸 Capturas
Adjunta screenshots si es posible.

## 🖥 Entorno
- Dispositivo: [ej. iPhone 14, PC HP]
- Navegador: [ej. Chrome 120, Safari 17]
- Sistema: [ej. iOS 17, Ubuntu 22.04]

## 📋 Información adicional
Cualquier detalle que pueda ayudar.
```

---

## 💡 Sugerir Funcionalidades

### Plantilla de Feature Request

```markdown
## 💡 Descripción de la funcionalidad
Descripción clara de lo que quieres que se agregue.

## 🎯 Problema que resuelve
¿Qué problema soluciona esta funcionalidad?

## 🛠 Solución propuesta
¿Cómo imaginas que debería funcionar?

## 🔄 Alternativas consideradas
¿Consideraste otras opciones?

## 📋 Información adicional
Contexto adicional, mockups, referencias, etc.
```

---

## 📚 Recursos Útiles

### Documentación Oficial

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Convenciones

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

### Herramientas Recomendadas

- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin
  - GitLens
- **Postman** o **Thunder Client** para probar APIs.

---

## 🙏 Agradecimientos

Cada contribución, por pequeña que sea, ayuda a mejorar esta herramienta para la gloria de Dios y el servicio a la comunidad de **Gracia Iglesia Cristiana**.

---

<div align="center">

### Hecho con ❤️ para la gloria de Dios

_"Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres"_
**— Colosenses 3:23**

¡Gracias por contribuir! 🙌

</div>
