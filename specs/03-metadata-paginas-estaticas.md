# SPEC-03: Metadata única por página estática

**Versión:** 1.0
**Estado:** aprobada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

Las 4 páginas estáticas (`/`, `/servicios`, `/contacto`, `/quienes-somos`) devuelven todas exactamente el mismo `<title>Imcontent</title>` y la misma meta description, heredados del `metadata` global de `app/layout.tsx`, porque ninguna exporta su propio `metadata`. Esto es una pérdida directa de relevancia en buscadores: cada página compite por keywords distintas y debería tener su propio title/description reflejando su contenido real. Esta spec añade metadata específica a cada una de las 4 páginas, basada en el contenido real que ya muestran.

---

## Actores

- **Rastreador de buscador:** lee `<title>` y meta description de cada página para decidir cómo mostrarla en resultados de búsqueda.
- **Usuario que busca en Google:** ve el title/description en el snippet de resultados — determina si hace clic.
- **Desarrollador:** exporta `metadata` en cada `page.tsx` en vez de depender del global de `layout.tsx`.

---

## Flujos principales

### Flujo 1: Next.js resuelve metadata por página

1. Un rastreador o navegador pide `/servicios`.
2. Next.js App Router resuelve el `metadata` exportado por `app/servicios/page.tsx` (más específico) en vez de heredar únicamente el de `app/layout.tsx` (metadata anidada de Next.js: la de la página sobreescribe/completa la del layout).
3. El HTML servido incluye `<title>` y `<meta name="description">` propios de esa página.
4. Lo mismo aplica para `/`, `/contacto` y `/quienes-somos`, cada una con su propio contenido.

---

## Flujos alternativos / Edge cases

- **Campos no definidos en la metadata de la página:** Next.js hace merge con el `metadata` del layout raíz — si una página no define `openGraph` (ver SPEC-06, fuera de esta spec), seguiría heredando cualquier valor global que exista en el layout (actualmente ninguno).
- **Metadata idéntica por error humano futuro:** no hay guardas automáticas contra esto; queda documentado en el CA-05 (todos los títulos deben ser distintos entre sí) como red de seguridad verificable en esta ronda.

---

## Criterios de aceptación

- [ ] CA-01: `app/page.tsx` exporta `metadata` con `title` y `description` específicos del contenido real de la home (contenido audiovisual creado con IA, rapidez/eficiencia/foco en resultados).
- [ ] CA-02: `app/servicios/page.tsx` exporta `metadata` con `title` y `description` específicos sobre los servicios/tipos de contenido audiovisual que ofrece imcontent.
- [ ] CA-03: `app/contacto/page.tsx` exporta `metadata` con `title` y `description` específicos sobre agendar sesión/contacto comercial.
- [ ] CA-04: `app/quienes-somos/page.tsx` exporta `metadata` con `title` y `description` específicos sobre el equipo e imcontent como parte de Immoral Group.
- [ ] CA-05: Los 4 `title` son distintos entre sí y distintos del `title` global de `app/layout.tsx` ("Imcontent").
- [ ] CA-06: Los 4 `description` son distintos entre sí y distintos de la description global de `app/layout.tsx`.
- [ ] CA-07: `pnpm build` compila sin errores tras el cambio.
- [ ] CA-08: Tras el deploy (o contra preview de Vercel), `curl` a cada una de las 4 rutas devuelve un `<title>` distinto en el HTML servido.

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

### Componentes reutilizables

Ninguno — cada página exporta su propio objeto `metadata: Metadata` (import de `next`), sin necesidad de un componente.

### Breakpoints obligatorios

No aplica — no hay cambio visual.

### Estándar de calidad visual

No aplica.

---

## API / Endpoints

### Endpoints nuevos

Ninguno.

### Endpoints modificados

No aplica — esto es metadata de página, no un endpoint de API.

### Contratos de request/response

No aplica.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno — el copy de metadata es contenido público de marketing.

### Validaciones server-side requeridas

Ninguna — son strings estáticos definidos en código, no input externo.

### Autenticación y autorización

No aplica.

### Otros riesgos identificados

Ninguno relevante.

*(SECURITY-AGENT aplicará el checklist de `.brianspec/security-checklists.md` sección "Tipo: web-app" durante la revisión — se espera veredicto NO BLOQUEANTE sin hallazgos, dado que no hay superficie sensible.)*

---

## Plan de implementación

### Arquitectura propuesta

Cada `page.tsx` de las 4 páginas estáticas (Server Components, ya lo son hoy) exporta una constante `metadata: Metadata` (tipo de `next`), siguiendo el mismo patrón que ya usa `app/(blog)/blog/page.tsx` (aunque ese usa `generateMetadata` porque depende de datos async; estas 4 páginas son estáticas, así que basta con `metadata` como objeto literal).

### Desglose de tareas

1. Redactar title/description de la home a partir del contenido real (`components/Hero.tsx`, `components/About.tsx`) y añadir `export const metadata: Metadata = {...}` en `app/page.tsx`.
2. Redactar title/description de servicios a partir del contenido real (`components/pages-legacy/ServicesPage.tsx`) y añadirlo a `app/servicios/page.tsx`.
3. Redactar title/description de contacto a partir del contenido real (`components/pages-legacy/ContactPage.tsx`) y añadirlo a `app/contacto/page.tsx`.
4. Redactar title/description de quiénes somos a partir del contenido real (`components/pages-legacy/AboutUsPage.tsx`) y añadirlo a `app/quienes-somos/page.tsx`.

### Dependencias con otras specs

- **Coordina con SPEC-06:** SPEC-06 añade `openGraph` al mismo objeto `metadata` de estas 4 páginas — se recomienda implementar ambas en el mismo PR para no tocar los mismos archivos dos veces en commits separados.

---

## Tests requeridos

### Tests unitarios

No aplica.

### Tests de integración

CA-08: `curl` contra cada ruta desplegada, verificar `<title>` en el HTML.

### Tests E2E

No aplica.

---

## Out of scope (explícito)

- JSON-LD estructurado — cubierto por SPEC-04 (Organization/WebSite) y fuera de alcance el `Article` de blog (motor externo).
- Open Graph — cubierto por SPEC-06.
- Metadata de las páginas del blog (`/blog`, `/blog/[slug]`) — ya tienen su propia `generateMetadata` funcionando correctamente (ver auditoría, hallazgo #7: solo faltan en las páginas estáticas).
- Traducción a otros idiomas — el sitio es solo español.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial, aprobada directamente para ejecución tras la auditoría SEO del 2026-07-13. | David Navarrete |
