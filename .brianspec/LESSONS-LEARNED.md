# LESSONS-LEARNED.md

**Proyecto:** imcontent-landing
**Sistema:** BrianSpec v1.2
**Última actualización:** 2026-07-13

Este archivo es la **memoria de errores y aprendizajes del proyecto**. Lo escribe `brianspec-build` al cerrar cada spec y lo lee al iniciar cada build. Su propósito es que los errores cometidos en una implementación no vuelvan a ocurrir.

---

## Cómo usar este archivo

- **Lectura:** `brianspec-build` lo carga en Fase 1 antes de implementar. Filtra por stack y tipo de funcionalidad.
- **Escritura:** `brianspec-build` lo actualiza en Fase 6 tras cada implementación.
- **Formato:** una entrada por lección, con estructura estándar. No escribir en prosa libre.
- **Limpieza:** si una lección queda obsoleta (se cambió el stack, se eliminó la funcionalidad), marcarla con `**Estado: OBSOLETA**` — no borrar.

---

## LL-001 — La base de datos del blog es compartida entre verticales y tiene dos espacios de IDs distintos
**Fecha:** 2026-07-13
**Spec origen:** SPEC-02
**Stack afectado:** Next.js App Router + Supabase compartido (`@Immoral-marketing/motor-blog`)
**Lección:** la tabla `articulos.vertical_id` referencia `verticales.id`, pero `paginas_seo.vertical_id` referencia `verticales_panel.id` — un espacio de IDs distinto (la fila de `verticales_panel` tiene su propio `id`, y una columna separada `vertical_id` que apunta a `verticales.id`). Usar `process.env.VERTICAL_ID` (que vive en el espacio de `verticales.id`) directamente para filtrar `paginas_seo` devuelve siempre 0 filas sin error visible. El helper `lib/vertical.ts` (`getVerticalConfig()`) ya resuelve esta conversión.
**Cómo aplicar:** cualquier query contra `paginas_seo` (o futuras tablas con el mismo patrón `vertical_id` en el espacio de `verticales_panel`) debe resolver primero `getVerticalConfig()` y usar `vertical.id`, nunca `process.env.VERTICAL_ID` directamente. Las queries contra `articulos` sí usan `process.env.VERTICAL_ID` directamente — no mezclar los dos espacios de IDs.
**Severidad:** Alta

## LL-002 — Comprobar siempre el `error` de Supabase, nunca solo el `data`
**Fecha:** 2026-07-13
**Spec origen:** SPEC-02
**Stack afectado:** Next.js App Router + `@supabase/supabase-js`
**Lección:** `const { data } = await supabase.from(...).select(...)` con una columna inexistente en el `select` no lanza excepción — Supabase devuelve `data: null` y un `error` que, si no se destructura y comprueba, se descarta en silencio. El `.map()` posterior sobre `(data || [])` produce simplemente un array vacío, sin ningún rastro en logs. Esto dejó el `sitemap.xml` de producción vacío (`<urlset></urlset>`) durante semanas sin ninguna alerta.
**Cómo aplicar:** toda query a Supabase que alimente una superficie pública (sitemap, robots, llms.txt, metadata) debe destructurar también `error` y hacer `console.error` (con contexto suficiente para depurar, sin exponer secretos) si `error` no es `null`.
**Severidad:** Alta

## Entradas

_(Añadir nuevas lecciones arriba de esta sección, con numeración `LL-NNN` incremental.)_
