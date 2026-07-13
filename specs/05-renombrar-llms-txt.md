# SPEC-05: Renombrar /llm.txt a /llms.txt

**Versión:** 1.0
**Estado:** aprobada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

El sitio sirve el archivo de contexto para LLMs en `/llm.txt`, pero la convención del estándar (y de la empresa) es `/llms.txt` (en plural). El contenido en sí (listado de artículos desde Supabase, con la misma base URL que SPEC-01 corrige) es correcto — solo la ruta está mal nombrada. Esta spec mueve la ruta a `/llms.txt` como canónica.

---

## Actores

- **Rastreador/LLM de IA (GPTBot, ClaudeBot, PerplexityBot, agentes de IA en general):** busca `/llms.txt` por convención — si no existe en esa ruta exacta, puede no encontrarlo nunca, aunque exista contenido equivalente en `/llm.txt`.
- **Desarrollador:** mueve el código de la ruta.

---

## Flujos principales

### Flujo 1: Bot de IA descubre /llms.txt

1. Un rastreador de IA pide `https://imcontent.es/llms.txt`.
2. Next.js resuelve la ruta `app/llms.txt/route.ts`, que ejecuta la misma lógica que hoy vive en `app/llm.txt/route.ts` (listado de artículos desde Supabase, base URL normalizada por SPEC-01).
3. El bot recibe el contenido con `Content-Type: text/plain`.

---

## Flujos alternativos / Edge cases

- **Algo (un enlace externo, un bot, una herramienta) ya apunta a `/llm.txt` (ruta antigua):** para no romper ese enlace, `/llm.txt` puede mantenerse sirviendo el mismo contenido (ver Ambigüedad resuelta en Historial) en vez de eliminarse — decisión: se mantiene `/llm.txt` como alias que devuelve exactamente el mismo contenido que `/llms.txt`, para no perder ningún acceso existente, pero `/llms.txt` es la ruta canónica y la única referenciada desde `robots.txt` o cualquier otro punto del sitio.
- **Duplicación de contenido entre ambas rutas:** ambas rutas ejecutan la misma lógica (se extrae a una función compartida) para evitar mantener el código dos veces.

---

## Criterios de aceptación

- [ ] CA-01: Existe la ruta `app/llms.txt/route.ts` y responde HTTP 200 con `Content-Type: text/plain` al pedir `/llms.txt`.
- [ ] CA-02: El contenido servido en `/llms.txt` es equivalente al que hoy sirve `/llm.txt` (mismo formato: nombre del sitio, descripción, URL, idioma, lista de artículos recientes).
- [ ] CA-03: `/llm.txt` sigue respondiendo HTTP 200 con el mismo contenido que `/llms.txt` (alias, no se rompe ningún enlace existente).
- [ ] CA-04: La lógica de construcción del contenido (consulta a Supabase + formateo) vive en un único lugar compartido entre ambas rutas, no duplicada.
- [ ] CA-05: `pnpm build` compila sin errores tras el cambio.
- [ ] CA-06: Tras el deploy (o contra preview de Vercel), `curl <url>/llms.txt` y `curl <url>/llm.txt` devuelven contenido idéntico.

---

## Modelo de datos

### Entidades nuevas o modificadas

No aplica.

### Relaciones

No aplica.

### Migraciones necesarias

No aplica.

---

## UI / Páginas afectadas

### Páginas nuevas

- `/llms.txt` (ruta canónica nueva).

### Páginas modificadas

- `/llm.txt` (pasa a ser un alias que delega en la misma lógica que `/llms.txt`, en vez de tener su propia implementación).

### Componentes reutilizables

Función compartida (ej. `lib/llms-txt.ts` con `buildLlmsTxtContent()`) que ambas rutas (`app/llms.txt/route.ts` y `app/llm.txt/route.ts`) importan y usan.

### Breakpoints obligatorios

No aplica.

### Estándar de calidad visual

No aplica.

---

## API / Endpoints

### Endpoints nuevos

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/llms.txt` | Listado de artículos + info del sitio en formato texto para LLMs (ruta canónica) | Pública |

### Endpoints modificados

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/llm.txt` | Pasa a delegar en la misma lógica que `/llms.txt` (alias de compatibilidad) | Pública |

### Contratos de request/response

Sin cambio de contrato respecto al `/llm.txt` actual — mismo `Content-Type: text/plain; charset=utf-8`, mismo formato Markdown-like del cuerpo.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno — mismo contenido público que ya se sirve hoy (títulos, slugs y meta descriptions de artículos publicados).

### Validaciones server-side requeridas

Ninguna adicional a las ya existentes en la implementación actual.

### Autenticación y autorización

No aplica.

### Otros riesgos identificados

Ninguno nuevo — es un cambio de ruta y de deduplicación de código, no de lógica de negocio.

*(SECURITY-AGENT aplicará el checklist de `.brianspec/security-checklists.md` sección "Tipo: web-app" durante la revisión.)*

---

## Plan de implementación

### Arquitectura propuesta

Extraer la lógica actual de `app/llm.txt/route.ts` a una función compartida en `lib/llms-txt.ts`. Crear `app/llms.txt/route.ts` que la use. Convertir `app/llm.txt/route.ts` en un wrapper de una línea que llama a la misma función, para mantenerlo como alias sin duplicar código.

### Desglose de tareas

1. Crear `lib/llms-txt.ts` con la función `getLlmsTxtContent()` (mueve ahí toda la lógica actual de `app/llm.txt/route.ts`: consulta a Supabase, construcción del string).
2. Crear `app/llms.txt/route.ts` que importa y usa `getLlmsTxtContent()`.
3. Simplificar `app/llm.txt/route.ts` para que también use `getLlmsTxtContent()` (alias).
4. Verificar que ambas rutas usan el helper normalizado de base URL de SPEC-01.

### Dependencias con otras specs

- **Coordina con SPEC-01:** la función movida debe seguir usando el helper `getBaseUrl()` de `lib/site-url.ts` para no reintroducir el bug de doble barra.

---

## Tests requeridos

### Tests unitarios

No aplica.

### Tests de integración

CA-06: `curl` comparando ambas rutas tras el deploy.

### Tests E2E

No aplica.

---

## Out of scope (explícito)

- Enriquecer el contenido de `llms.txt` más allá de lo que ya existe (no se añaden nuevas secciones, solo se corrige la ruta y se corrige el bug heredado de SPEC-01).
- Eliminar `/llm.txt` por completo — se mantiene como alias por prudencia, sin coste de mantenimiento adicional (comparte lógica).

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial, aprobada directamente para ejecución tras la auditoría SEO del 2026-07-13. Resuelta de entrada la ambigüedad "romper `/llm.txt` vs mantenerlo": se mantiene como alias de compatibilidad, `/llms.txt` es la ruta canónica. | David Navarrete |
