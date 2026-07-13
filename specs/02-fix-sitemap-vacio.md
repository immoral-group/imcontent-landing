# SPEC-02: Fix del sitemap vacío (dos bugs independientes en app/sitemap.ts)

**Versión:** 1.1
**Estado:** aprobada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

`https://imcontent.es/sitemap.xml` devuelve `<urlset></urlset>` — cero URLs, a pesar de que hay 151 artículos publicados y 4 páginas estáticas dadas de alta. La causa son **dos bugs independientes** en `app/sitemap.ts`, ambos silenciosos porque el código nunca comprueba el `error` de las respuestas de Supabase: (1) el `select` de `articulos` pide una columna `updated_at` que no existe en esa tabla, y (2) el `select` de `paginas_seo` filtra por `vertical_id` usando el ID equivocado — `paginas_seo.vertical_id` vive en el espacio de IDs de `verticales_panel.id`, no en el de `verticales.id` (que es lo que trae `process.env.VERTICAL_ID`). Esta spec corrige ambos y añade comprobación de errores para que un fallo similar nunca vuelva a pasar en silencio.

---

## Actores

- **Rastreador de buscador / IA:** consume el sitemap para descubrir URLs. Con el bug, no descubre ninguna página de imcontent salvo que llegue a ellas navegando.
- **Next.js (build/runtime):** ejecuta `app/sitemap.ts` en cada petición a `/sitemap.xml` (con `revalidate = 3600`).
- **Supabase (`newsletter-blog-project`):** responde a las dos queries (`articulos`, `paginas_seo`) con datos o con error.
- **Administrador del blog / desarrollador:** debe poder ver en los logs de Vercel si alguna de las dos queries falla, en vez de descubrirlo por un sitemap vacío en producción.

---

## Flujos principales

### Flujo 1: Generación correcta del sitemap

1. Un rastreador o un `curl` pide `/sitemap.xml`.
2. Next.js ejecuta `sitemap()`, que resuelve primero la configuración del vertical vía `getVerticalConfig()` (`lib/vertical.ts`), obteniendo el `id` propio de la fila de `verticales_panel` para imcontent.
3. Consulta `paginas_seo` filtrando por `vertical_id = vertical.id` (el ID del panel, no `process.env.VERTICAL_ID`) y `noindex = false`, seleccionando `path, updated_at` (columna que sí existe en esta tabla).
4. Consulta `articulos` filtrando por `vertical_id = process.env.VERTICAL_ID` (el ID de `verticales`, que es el espacio correcto para esta tabla), `estado = 'publicado'`, `noindex = false`, seleccionando `slug, fecha_publicacion` (sin `updated_at`, que no existe en `articulos`).
5. Si cualquiera de las dos consultas devuelve `error`, se registra con `console.error` (incluyendo el nombre de la tabla y el mensaje de error, sin exponer secretos) y se continúa con un array vacío para esa fuente, sin romper el resto del sitemap.
6. Cada página estática se mapea a `{ url: baseUrl + path, lastModified: updated_at, changeFrequency: 'monthly', priority: path === '/' ? 1.0 : 0.6 }`.
7. Cada artículo se mapea a `{ url: baseUrl + '/blog/' + slug, lastModified: fecha_publicacion, changeFrequency: 'weekly', priority: 0.8 }`.
8. El sitemap final es la unión de ambas listas, servido como XML válido.

---

## Flujos alternativos / Edge cases

- **`fecha_publicacion` es `null` en algún artículo:** no debería ocurrir para artículos en estado `publicado` (dato de negocio), pero si ocurriera, se usa la fecha actual (`new Date()`) como `lastModified` en lugar de fallar el `.map()` con `Invalid Date`.
- **`paginas_seo` no tiene ninguna fila para el vertical (antes del fix de datos):** el sitemap sigue sirviendo los artículos igualmente — las dos fuentes son independientes, un fallo/vacío en una no bloquea la otra.
- **`getVerticalConfig()` devuelve `null` (vertical no encontrado en `verticales_panel`):** la query de `paginas_seo` se salta (o se ejecuta con un filtro que garantizadamente no matchea, ej. `vertical_id = ''`) y se registra un `console.error` indicando que no se resolvió la config del vertical — nunca se lanza una excepción no controlada que rompa el endpoint completo.
- **Error de red/timeout de Supabase:** ambas queries capturan su `error` de forma independiente; un fallo en una no debe impedir que la otra se sirva.
- **Más de 50.000 URLs:** no aplica hoy (155 URLs). Fuera de alcance de esta spec (ver Out of scope).

---

## Criterios de aceptación

- [ ] CA-01: El `select` de `articulos` en `app/sitemap.ts` ya no incluye `updated_at`; usa `fecha_publicacion` como `lastModified`.
- [ ] CA-02: El `select` de `paginas_seo` filtra por el `id` devuelto por `getVerticalConfig()` (espacio de IDs de `verticales_panel`), no por `process.env.VERTICAL_ID` directamente.
- [ ] CA-03: El `select` de `articulos` sigue filtrando por `process.env.VERTICAL_ID` directamente (espacio de IDs de `verticales`) — no se cambia esta parte, solo la de `paginas_seo`.
- [ ] CA-04: Si `error` no es `null` en la consulta a `articulos` o a `paginas_seo`, se ejecuta `console.error` con el nombre de la tabla y el mensaje de error antes de continuar.
- [ ] CA-05: `pnpm build` compila sin errores tras el cambio.
- [ ] CA-06: Ejecutando la query equivalente ya corregida contra la base de datos real (`newsletter-blog-project`, proyecto `cnulbzfqwfkqvfkmbnxj`) se confirma que devuelve los 151 artículos publicados de imcontent y las 4 páginas estáticas de `paginas_seo` (verificado en esta spec vía Supabase MCP antes de la implementación — ver Historial).
- [ ] CA-07: Tras el deploy (o contra el preview de Vercel si el PR lo genera), `curl <url>/sitemap.xml` devuelve un `<urlset>` con más de 150 entradas `<url>`.

---

## Modelo de datos

### Entidades nuevas o modificadas

No aplica — no se modifica el esquema. Nota informativa (no acción de esta spec): las 4 filas de `paginas_seo` para imcontent (`/`, `/servicios`, `/contacto`, `/quienes-somos`) ya fueron insertadas manualmente en producción usando el `id` correcto de `verticales_panel` (`28cfe07f-5e0a-4228-b072-07b95772fd51`) como parte de la investigación de esta spec.

### Relaciones

`articulos.vertical_id` → `verticales.id`. `paginas_seo.vertical_id` → `verticales_panel.id`. Son dos espacios de IDs distintos sobre la misma base de datos compartida — documentado también en `.brianspec/LESSONS-LEARNED.md` (LL-001).

### Migraciones necesarias

No aplica — no se toca el esquema, solo se corrige la query.

---

## UI / Páginas afectadas

### Páginas nuevas

Ninguna.

### Páginas modificadas

Ninguna visualmente — cambio interno en `app/sitemap.ts`.

### Componentes reutilizables

Ninguno.

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
| GET | `/sitemap.xml` | Ahora devuelve las URLs reales de páginas estáticas y artículos | Pública |

### Contratos de request/response

Sin cambio de contrato — sigue siendo XML `MetadataRoute.Sitemap` de Next.js.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno — todas las URLs son públicas por definición.

### Validaciones server-side requeridas

Ninguna adicional sobre input externo (no hay input de usuario en este endpoint).

### Autenticación y autorización

No aplica — endpoint público.

### Otros riesgos identificados

- **Fallos silenciosos de Supabase:** mitigado por CA-04 (logging de `error`). Este es el riesgo raíz que causó el bug original — se documenta también en `.brianspec/LESSONS-LEARNED.md` (LL-002) para que no se repita en otros endpoints similares (`robots.txt`, `llms.txt`, futuras queries).

*(SECURITY-AGENT aplicará el checklist de `.brianspec/security-checklists.md` sección "Tipo: web-app" durante la revisión.)*

---

## Plan de implementación

### Arquitectura propuesta

Modificar únicamente `app/sitemap.ts`: importar `getVerticalConfig` de `lib/vertical`, resolver el vertical antes de la query a `paginas_seo`, corregir el `select` de `articulos`, y envolver ambas queries con comprobación de `error`.

### Desglose de tareas

1. Importar `getVerticalConfig` en `app/sitemap.ts`.
2. Resolver `const vertical = await getVerticalConfig()` y usar `vertical?.id || ''` como filtro de `vertical_id` en la query a `paginas_seo`.
3. Quitar `updated_at` del `select` de `articulos`; usar `fecha_publicacion` como `lastModified`.
4. Destructurar `error` en ambas queries (`const { data, error } = await ...`) y hacer `console.error` si no es `null`.
5. Verificar con Supabase MCP (o `psql`/dashboard si no hay MCP disponible) que la query corregida a `paginas_seo` con el ID del panel devuelve las 4 filas, y la de `articulos` devuelve los 151 artículos.

### Dependencias con otras specs

- **Ninguna bloqueante.** Puede implementarse en paralelo con SPEC-01 (ambas tocan `app/sitemap.ts`, pero en líneas distintas — se recomienda aplicarlas en el mismo commit para evitar conflictos triviales).

---

## Tests requeridos

### Tests unitarios

Ninguno obligatorio — la función es declarativa y depende de datos externos (Supabase); se verifica mejor con la consulta directa (CA-06) y el `curl` post-deploy (CA-07).

### Tests de integración

- CA-06: consulta SQL equivalente ejecutada contra la base de datos real vía Supabase MCP.
- CA-07: `curl` contra el sitemap desplegado.

### Tests E2E

No aplica.

---

## Out of scope (explícito)

- Sitemap-index / división en múltiples sitemaps (no aplica con ~155 URLs).
- Corregir el esquema de `articulos` para añadir `updated_at` — no es necesario, `fecha_publicacion` es suficiente como `lastModified` y modificar el esquema de una tabla compartida con otro vertical está fuera de alcance de esta spec (ver PROJECT-CONSTITUTION.md sección 7).
- Dar de alta más páginas estáticas en `paginas_seo` más allá de las 4 ya existentes — es una tarea de contenido/operación, no de código.
- Corregir el mismo patrón de bug en otros verticales que puedan compartir la tabla `paginas_seo` — fuera del alcance de este repo.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial — cubre el bug de `updated_at` inexistente en `articulos`, detectado en la auditoría SEO. | David Navarrete |
| 1.1 | 2026-07-13 | Ampliada para cubrir un segundo bug independiente, descubierto durante la implementación: `paginas_seo.vertical_id` vive en el espacio de IDs de `verticales_panel`, no en el de `verticales` (`process.env.VERTICAL_ID`). Verificado directamente contra la base de datos vía Supabase MCP: la query con el ID de `verticales` devuelve 0 filas en `paginas_seo`; con el ID correcto de `verticales_panel` (`28cfe07f-5e0a-4228-b072-07b95772fd51`) devuelve las 4 páginas estáticas ya insertadas. Añadidos CA-02, CA-03 y CA-06; añadida lección LL-001 en `.brianspec/LESSONS-LEARNED.md`. | David Navarrete |
