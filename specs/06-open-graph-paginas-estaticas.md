# SPEC-06: Open Graph en páginas estáticas e índice /blog

**Versión:** 1.0
**Estado:** aprobada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

Las 4 páginas estáticas (`/`, `/servicios`, `/contacto`, `/quienes-somos`) no tienen ninguna etiqueta `og:` — confirmado con curl contra producción. Esto degrada cómo se ven los enlaces al compartirse en redes sociales, WhatsApp, Slack, etc. (sin preview de título/imagen). Los artículos individuales del blog SÍ tienen Open Graph completo (vía `generateMetadata` en `app/(blog)/blog/[slug]/page.tsx`, que vive en este repo). El índice `/blog` (`app/(blog)/blog/page.tsx`) también vive en este repo y hoy solo define `title`/`description`, sin `openGraph`. Esta spec añade `openGraph` a las 4 páginas estáticas (reutilizando el `metadata` de SPEC-03) y al índice `/blog`.

---

## Actores

- **Usuario que comparte un enlace** (WhatsApp, LinkedIn, Slack, etc.): ve un preview enriquecido (título, descripción, imagen) en vez de un enlace pelado.
- **Rastreador de redes sociales** (Facebook/WhatsApp crawler, Twitter/X card crawler, LinkedIn crawler): lee las etiquetas `og:` al generar el preview del enlace compartido.
- **Desarrollador:** añade el bloque `openGraph` al `metadata`/`generateMetadata` de cada página afectada.

---

## Flujos principales

### Flujo 1: Preview al compartir la home o una página comercial

1. Un usuario comparte `https://imcontent.es/servicios` en WhatsApp o LinkedIn.
2. El crawler de la red social pide la URL y lee las etiquetas `og:title`, `og:description`, `og:url`, `og:type` (y `og:image` si hay una imagen representativa disponible) del HTML servido.
3. La red social muestra un preview con esos datos en vez de un enlace sin contexto.

### Flujo 2: Preview al compartir el índice del blog

1. Un usuario comparte `https://imcontent.es/blog`.
2. El crawler lee las etiquetas `og:` que `app/(blog)/blog/page.tsx` añade a su `generateMetadata` existente.
3. Se muestra un preview enriquecido del índice del blog.

---

## Flujos alternativos / Edge cases

- **No hay imagen representativa para alguna de las 4 páginas estáticas:** se omite `og:image` para esa página en vez de usar una imagen genérica/placeholder que no represente bien el contenido — es preferible un preview sin imagen a uno con una imagen incorrecta o rota.
- **El índice `/blog` ya tiene `title`/`description` propios vía `blogConfig`:** el `openGraph` reutiliza esos mismos valores (no se inventan textos distintos) para mantener coherencia entre lo que ve un usuario en el `<title>` del navegador y lo que ve al compartir el enlace.
- **Artículos individuales del blog:** ya tienen Open Graph completo — fuera de alcance de esta spec (no se toca `[slug]/page.tsx`, salvo que ya esté correcto, lo cual está confirmado en la auditoría).

---

## Criterios de aceptación

- [ ] CA-01: `app/page.tsx` incluye `openGraph` en su `metadata` con al menos `title`, `description`, `url` y `type: 'website'`.
- [ ] CA-02: `app/servicios/page.tsx` incluye `openGraph` equivalente, específico de esa página.
- [ ] CA-03: `app/contacto/page.tsx` incluye `openGraph` equivalente, específico de esa página.
- [ ] CA-04: `app/quienes-somos/page.tsx` incluye `openGraph` equivalente, específico de esa página.
- [ ] CA-05: `app/(blog)/blog/page.tsx` añade `openGraph` a su `generateMetadata` existente, reutilizando `blogConfig.siteName` y `blogConfig.hero.subtitle` (los mismos valores que ya usa para `title`/`description`).
- [ ] CA-06: El `url` de cada `openGraph` se construye con el helper normalizado de `NEXT_PUBLIC_APP_URL` (`lib/site-url.ts`, SPEC-01), no hardcodeado.
- [ ] CA-07: `pnpm build` compila sin errores tras el cambio.
- [ ] CA-08: Tras el deploy (o contra preview de Vercel), `curl` a cada una de las 5 rutas (`/`, `/servicios`, `/contacto`, `/quienes-somos`, `/blog`) devuelve HTML con al menos `og:title` y `og:description`.

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

- `app/page.tsx`
- `app/servicios/page.tsx`
- `app/contacto/page.tsx`
- `app/quienes-somos/page.tsx`
- `app/(blog)/blog/page.tsx`

### Componentes reutilizables

Ninguno nuevo — se añade el campo `openGraph` al mismo objeto `metadata`/`generateMetadata` que ya existe o que introduce SPEC-03.

### Breakpoints obligatorios

No aplica.

### Estándar de calidad visual

No aplica.

---

## API / Endpoints

### Endpoints nuevos

Ninguno.

### Endpoints modificados

No aplica — es metadata de página, no un endpoint.

### Contratos de request/response

No aplica.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno — mismo copy público de marketing que title/description.

### Validaciones server-side requeridas

Ninguna — valores estáticos, sin input externo (salvo `/blog`, que reutiliza `blogConfig`, ya validado/controlado por el propio código).

### Autenticación y autorización

No aplica.

### Otros riesgos identificados

Ninguno relevante.

*(SECURITY-AGENT aplicará el checklist de `.brianspec/security-checklists.md` sección "Tipo: web-app" durante la revisión.)*

---

## Plan de implementación

### Arquitectura propuesta

Añadir la propiedad `openGraph` al objeto `metadata` (páginas estáticas, objeto literal) o al retorno de `generateMetadata` (`/blog`, ya es async) existente en cada archivo. No se introduce infraestructura nueva.

### Desglose de tareas

1. Añadir `openGraph` a `app/page.tsx` (tras SPEC-03).
2. Añadir `openGraph` a `app/servicios/page.tsx` (tras SPEC-03).
3. Añadir `openGraph` a `app/contacto/page.tsx` (tras SPEC-03).
4. Añadir `openGraph` a `app/quienes-somos/page.tsx` (tras SPEC-03).
5. Añadir `openGraph` al `generateMetadata` de `app/(blog)/blog/page.tsx`.

### Dependencias con otras specs

- **Depende de SPEC-03:** las 4 páginas estáticas necesitan primero el objeto `metadata` que SPEC-03 introduce; `openGraph` se añade dentro de ese mismo objeto. Se recomienda implementar SPEC-03 y SPEC-06 en el mismo PR/commit para las páginas estáticas.
- **Depende de SPEC-01:** reutiliza `getBaseUrl()` de `lib/site-url.ts`.

---

## Tests requeridos

### Tests unitarios

No aplica.

### Tests de integración

CA-08: `curl` contra las 5 rutas desplegadas.

### Tests E2E

No aplica.

---

## Out of scope (explícito)

- Open Graph de artículos individuales del blog (`/blog/[slug]`) — ya implementado correctamente, confirmado en la auditoría (hallazgo #7 solo menciona las páginas estáticas).
- `og:image` para las páginas que no tengan una imagen representativa clara — se documenta como pendiente de asset de marketing, no bloquea esta spec.
- Twitter Cards (`twitter:card`, etc.) en las páginas estáticas — el índice y artículos del blog ya los tienen vía el motor; añadirlos a las páginas estáticas se puede evaluar en una spec futura si se considera prioritario.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial, aprobada directamente para ejecución tras la auditoría SEO del 2026-07-13. | David Navarrete |
