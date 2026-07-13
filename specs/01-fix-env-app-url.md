# SPEC-01: Fix de la variable de entorno NEXT_PUBLIC_APP_URL

**Versión:** 1.0
**Estado:** aprobada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

`process.env.NEXT_PUBLIC_APP_URL` es la base de todas las URLs absolutas que genera el sitio: el `canonical` de cada artículo del blog, el contenido de `/llm.txt` (futuro `/llms.txt`, ver SPEC-05) y la línea `Sitemap:` de `/robots.txt`. En producción, esta variable está mal configurada en Vercel (`https://imcontent-landing.vercel.app/` — dominio de preview, no el real, y con barra final), lo que rompe el canonical de cada artículo, el contenido de `llm.txt` y la directiva `Sitemap` de `robots.txt` simultáneamente. Esta spec documenta el valor correcto que debe configurarse en Vercel y, como red de seguridad permanente, añade normalización defensiva en el código para que un error de configuración similar en el futuro no vuelva a producir URLs rotas (dominio equivocado no se puede corregir por código, pero la doble barra sí).

---

## Actores

- **Administrador de Vercel (con acceso al dashboard):** corrige el valor de la variable de entorno en Production. Acción manual, fuera de este repo.
- **Rastreador de buscador / IA (Googlebot, GPTBot, ClaudeBot, etc.):** consume `canonical`, `robots.txt` y `llms.txt` para descubrir e indexar contenido. Se ve directamente afectado por URLs rotas.
- **Next.js (build/runtime en Vercel):** lee `NEXT_PUBLIC_APP_URL` en tres puntos del código (`app/sitemap.ts`, `app/robots.txt/route.ts`, `app/llm.txt/route.ts` → `app/llms.txt/route.ts` tras SPEC-05) para construir URLs absolutas.

---

## Flujos principales

### Flujo 1: Corrección manual de la variable en Vercel (fuera de este repo)

1. Un administrador con acceso al dashboard de Vercel entra en el proyecto `imcontent-landing` → Settings → Environment Variables.
2. Localiza `NEXT_PUBLIC_APP_URL` en el entorno **Production**.
3. Cambia su valor a `https://imcontent.es` (sin barra final, dominio real).
4. Redeploya producción (o espera al siguiente deploy) para que el cambio tome efecto.

### Flujo 2: Normalización defensiva en el código (esta spec, parte de código)

1. Cada uno de los tres archivos que leen `NEXT_PUBLIC_APP_URL` (`app/sitemap.ts`, `app/robots.txt/route.ts`, `app/llm.txt/route.ts`) obtiene el valor crudo de la variable.
2. Antes de concatenar cualquier ruta, el valor se normaliza quitando cualquier barra final (`/+$`).
3. Todas las URLs absolutas construidas a partir de esa base quedan siempre bien formadas (`${baseUrl}/ruta`, nunca `${baseUrl}//ruta`), independientemente de si la variable de entorno tiene o no barra final.

---

## Flujos alternativos / Edge cases

- **Variable no configurada (`undefined`):** el código ya usa `|| ''` como fallback — con la normalización, un string vacío sigue siendo un string vacío (no lanza excepción al hacer `.replace()` sobre `''`). Las URLs resultantes serán relativas rotas (`/blog/slug`), visible inmediatamente en cualquier verificación manual — no se enmascara el problema, solo se evita el bug de doble barra.
- **Variable con múltiples barras finales (`https://imcontent.es///`):** la regex `/\/+$/` las elimina todas, no solo una.
- **Variable con barra final Y el dominio de preview incorrecto simultáneamente (el caso real detectado en la auditoría):** la normalización arregla la doble barra, pero el dominio equivocado solo se corrige cambiando el valor en Vercel (Flujo 1). Esta spec no puede "adivinar" el dominio correcto desde el código — por diseño, es una variable de entorno.

---

## Criterios de aceptación

- [ ] CA-01: La spec documenta explícitamente que el valor correcto de `NEXT_PUBLIC_APP_URL` en Vercel → Settings → Environment Variables → Production es `https://imcontent.es` (sin barra final).
- [ ] CA-02: `app/sitemap.ts`, `app/robots.txt/route.ts` y `app/llm.txt/route.ts` (o su ubicación tras SPEC-05) normalizan el valor de `NEXT_PUBLIC_APP_URL` quitando la barra final antes de usarlo para construir cualquier URL.
- [ ] CA-03: Dado `NEXT_PUBLIC_APP_URL=https://ejemplo.es/` (con barra final, simulando el error real de configuración), ninguna URL generada por los tres puntos anteriores contiene `//` inmediatamente después del dominio (excepto el `https://` inicial).
- [ ] CA-04: `pnpm build` compila sin errores tras el cambio.
- [ ] CA-05: El cambio de la variable en Vercel Production queda marcado en el informe de implementación como acción manual pendiente, no ejecutada por este repo.

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

Ninguna.

### Páginas modificadas

Ninguna visualmente — el cambio es de generación de URLs en respuestas de texto/XML (`sitemap.xml`, `robots.txt`, `llms.txt`) y en el `canonical` de los artículos del blog (heredado del paquete `motor-blog`, que lee la misma variable).

### Componentes reutilizables

Ninguno nuevo. Se propone extraer la normalización a un helper compartido (`lib/site-url.ts`) para no triplicar la misma línea de regex en tres archivos.

### Breakpoints obligatorios

No aplica.

### Estándar de calidad visual

No aplica.

---

## API / Endpoints

### Endpoints nuevos

Ninguno.

### Endpoints modificados

| Método | Ruta | Descripción | Autenticación |
|---|---|---|---|
| GET | `/sitemap.xml` | URLs base normalizadas antes de construir cada `loc` | Pública |
| GET | `/robots.txt` | URL base normalizada antes de construir la línea `Sitemap:` | Pública |
| GET | `/llm.txt` (→ `/llms.txt` tras SPEC-05) | URL base normalizada antes de construir enlaces a artículos | Pública |

### Contratos de request/response

Sin cambios de contrato — mismo `Content-Type` y forma de respuesta, solo cambia la construcción interna de la URL base.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno. `NEXT_PUBLIC_APP_URL` es pública por diseño (prefijo `NEXT_PUBLIC_`).

### Validaciones server-side requeridas

Ninguna adicional — la normalización es una transformación determinística de un string, sin input de usuario.

### Autenticación y autorización

No aplica — endpoints públicos.

### Otros riesgos identificados

- **Riesgo de enmascarar un error de configuración real:** la normalización corrige el síntoma de la doble barra, pero no corrige un dominio erróneo. Se documenta explícitamente para que nadie asuma que "ya está arreglado" sin cambiar la variable en Vercel.

*(SECURITY-AGENT aplicará el checklist de `.brianspec/security-checklists.md` sección "Tipo: web-app" durante la revisión. Esta spec no toca autenticación, BBDD ni inputs de usuario.)*

---

## Plan de implementación

### Arquitectura propuesta

Crear un helper compartido `lib/site-url.ts` que exporte `getBaseUrl(): string`, leyendo `process.env.NEXT_PUBLIC_APP_URL` y aplicando `.replace(/\/+$/, '')`. Sustituir la lectura directa de la variable en los tres archivos afectados por una llamada a este helper.

### Desglose de tareas

1. Crear `lib/site-url.ts` con `getBaseUrl()`.
2. Sustituir `process.env.NEXT_PUBLIC_APP_URL || ''` por `getBaseUrl()` en `app/sitemap.ts`.
3. Sustituir `process.env.NEXT_PUBLIC_APP_URL || ''` por `getBaseUrl()` en `app/robots.txt/route.ts`.
4. Sustituir `process.env.NEXT_PUBLIC_APP_URL || ''` por `getBaseUrl()` en `app/llm.txt/route.ts` (o la ruta resultante tras aplicar SPEC-05).
5. Documentar en el PR, como acción manual pendiente, el cambio de valor de la variable en Vercel Production.

### Dependencias con otras specs

- **Coordina con SPEC-05:** si SPEC-05 se implementa en el mismo PR, el archivo relevante pasa a ser `app/llms.txt/route.ts`.

---

## Tests requeridos

### Tests unitarios

Ninguno obligatorio — la función es trivial (una regex). Opcionalmente, un test unitario de `getBaseUrl()` con casos: sin barra, con una barra, con varias barras, vacío.

### Tests de integración

Verificación manual con `curl` contra el deploy de preview/producción tras el fix: confirmar que `robots.txt`, `sitemap.xml` y `llms.txt` no contienen `//` duplicado en ninguna URL.

### Tests E2E

No aplica.

---

## Out of scope (explícito)

- Cambiar el valor de la variable en Vercel — es una acción manual fuera del repo, documentada pero no ejecutada por esta spec.
- Corregir el `canonical` de los artículos de blog en el paquete `@Immoral-marketing/motor-blog` — ese paquete vive en otro repo; una vez la variable de Vercel se corrija, el canonical se arregla automáticamente porque lee la misma variable, sin necesidad de tocar el paquete.
- Validación de formato de URL (protocolo, dominio válido) en `NEXT_PUBLIC_APP_URL` — fuera de alcance, se asume que quien configura la variable en Vercel introduce una URL válida.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial, aprobada directamente para ejecución tras la auditoría SEO del 2026-07-13. | David Navarrete |
