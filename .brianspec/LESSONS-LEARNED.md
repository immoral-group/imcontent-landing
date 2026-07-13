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

## LL-003 — `revalidate` solo no basta: puede servir una respuesta cacheada (incluso vacía o 404) tras un redeploy con el fix ya aplicado
**Fecha:** 2026-07-13
**Spec origen:** SPEC-02 / SPEC-05 (verificación post-deploy)
**Stack afectado:** Next.js App Router (Route Handlers con `export const revalidate = N`) + Vercel
**Lección:** tras mergear y desplegar el fix de SPEC-02, `curl https://imcontent.es/sitemap.xml` seguía devolviendo `<urlset></urlset>` (vacío) con cabecera `X-Vercel-Cache: HIT` — una respuesta cacheada de ANTES del fix, no una ejecución fresca del código nuevo. Por separado, `/llms.txt` (ruta nueva) devolvía 404 con `X-Matched-Path: /404` y también `X-Vercel-Cache: HIT`, mientras que `/llm.txt` (alias, mismo código, ya existía antes del cambio de convención de caché) sí funcionaba con `X-Vercel-Cache: PRERENDER` y contenido fresco. Un `git commit --allow-empty` + push a `master` para forzar un deploy limpio (sin build cache) NO resolvió el problema — confirma que el problema no es de build cache de dependencias, sino del cacheo de la respuesta HTTP de la propia ruta (Full Route Cache / Data Cache de Next.js en Vercel), que puede persistir entre deploys.
**Cómo aplicar:** en rutas públicas críticas para SEO (`sitemap.xml`, `robots.txt`, `llms.txt`) que dependen de datos externos (Supabase) y donde servir contenido stale tiene coste real (Google/IA no descubren contenido nuevo), añadir `export const dynamic = 'force-dynamic'` junto al `revalidate` — esto fuerza ejecución en cada petición y evita depender de que el cacheo estático/ISR se invalide correctamente tras un deploy. Verificar siempre post-deploy con `curl -I` mirando la cabecera `X-Vercel-Cache` (debe ser `MISS` o no aparecer, nunca `HIT` con contenido que se sabe que cambió) antes de dar por buena una implementación.
**Severidad:** Alta

## LL-004 — `getVerticalConfig()` siempre devolvía `null` en producción: RLS bloquea `verticales_panel` para el rol `anon`
**Fecha:** 2026-07-13
**Spec origen:** SPEC-02 (verificación post-deploy, tras resolver LL-001/LL-003)
**Stack afectado:** Next.js App Router + Supabase RLS + `@supabase/supabase-js` (cliente anon)
**Lección:** tras arreglar el bug de espacio de IDs (LL-001) y el cacheo stale (LL-003), `sitemap.xml` en producción devolvía los 151 artículos pero seguía sin las 4 páginas estáticas. Causa: `verticales_panel` tiene una única política RLS (`service_role full access`, rol `service_role`) — **no hay ninguna política para `anon`/`public`**, a propósito, porque la tabla contiene columnas sensibles (`ownership_token`, `ownership_token_hash`, `newsletter_token`, `notif_email`, `slack_channel_id`). El cliente Supabase de la app (`lib/supabase.ts`, re-exportado del paquete `@Immoral-marketing/motor-blog`) usa la clave anon. Por tanto `getVerticalConfig()` (`lib/vertical.ts`) — que hace `select('*')` directo sobre `verticales_panel` — **siempre ha devuelto `null` en cualquier entorno de producción**, sin error visible (RLS deniega en silencio, `error` no se comprobaba). Esto no es un bug introducido en esta ronda: probablemente lleva roto desde que se escribió la función, solo que hasta ahora nada dependía de que devolviera datos reales (los usos existentes, como `robots_extra_rules` en `robots.txt/route.ts`, son opcionales y su ausencia pasaba desapercibida).
**Cómo aplicar:** para leer config no sensible de `verticales_panel` desde código con la clave anon, **no** añadir una política RLS pública sobre la tabla completa (expondría los tokens). Crear una vista (`verticales_panel_public`) que seleccione solo las columnas no sensibles necesarias (`id`, `vertical_id`, `seo_site_title`, `seo_default_og_image`, `robots_extra_rules`, `llm_txt_description`, `logo_url`, `dominio_blog`, `google_analytics_id`, `google_tag_manager_id`) y conceder `SELECT` sobre esa vista a `anon`/`authenticated`. El código de la app debe consultar la vista, nunca la tabla. Aplica a cualquier otro vertical que use este mismo patrón (ej. `immoralia.es/blog`, que muy probablemente tiene el mismo bug silencioso).
**Severidad:** Alta

## Entradas

_(Añadir nuevas lecciones arriba de esta sección, con numeración `LL-NNN` incremental.)_
