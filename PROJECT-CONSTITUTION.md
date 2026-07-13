# PROJECT-CONSTITUTION.md

**Proyecto:** imcontent-landing
**Versión de Constitution del proyecto:** 1.0
**Hereda de:** BRIANSPEC-CONSTITUTION.md v1.1
**Última actualización:** 2026-07-13
**Owner del proyecto:** David Navarrete

> Este archivo define las decisiones fundacionales específicas de imcontent-landing. Hereda y complementa los principios globales de `BRIANSPEC-CONSTITUTION.md` — nunca los contradice.

---

## 1. Descripción del proyecto

**Tipo de proyecto:** web-app

**Qué problema resuelve:**
imcontent-landing es la web pública de imcontent, agencia de contenido audiovisual creado con IA (dominio de producción `https://imcontent.es`). Sirve como landing comercial (home, servicios, contacto, quiénes somos) y como blog de contenido editorial (`/blog`, `/blog/[slug]`) para captación orgánica y SEO/GEO.

**Actores principales:**
- **Visitante orgánico / prospecto:** navega las páginas comerciales y el blog, rellena el formulario de contacto.
- **Rastreadores de buscadores e IA (Googlebot, GPTBot, ClaudeBot, etc.):** descubren e indexan las páginas públicas vía `sitemap.xml`, `robots.txt` y `llms.txt`.
- **Equipo de imcontent / immoralia:** administra el contenido del blog desde el panel compartido y da seguimiento a métricas SEO.

**Alcance del MVP:**
Web pública ya desplegada en Vercel con páginas estáticas de marketing y blog funcional conectado a Supabase. El alcance de esta ronda de trabajo (ver `/specs/`) es exclusivamente la corrección de la base técnica de SEO (sitemap, robots, metadata, JSON-LD, Open Graph) detectada en la auditoría del 2026-07-13.

**Fuera de alcance (explícito):**
- Cambios de diseño visual o de contenido comercial de las páginas estáticas.
- Cambios en el paquete compartido `@Immoral-marketing/motor-blog` (vive en su propio repo/paquete npm).
- Alta y verificación en Google Search Console (acción manual, ver SPEC-08).
- Configuración de analítica (GTM/GA4) más allá de documentar que falta el ID (ver SPEC-07).

---

## 2. Stack tecnológico

### Lenguajes y runtime

TypeScript / React 19, Node.js (runtime de Next.js en Vercel).

### Frameworks y librerías principales

- **Next.js 16 (App Router)** — migrado desde Vite (ver `.claude/CLAUDE.md` para el historial completo de esa migración).
- **@Immoral-marketing/motor-blog** — paquete privado (GitHub Packages) que provee el motor de blog compartido (listado, ficha de artículo, tracking, cliente Supabase) usado también por `immoralia.es/blog`.
- Tailwind CSS v4, MUI v7, Radix UI, Framer Motion (`motion`), Spline — heredados de la migración desde Figma/Vite, usados en las páginas comerciales legacy (`components/pages-legacy/`).

### Servicios y plataformas

- **Vercel** — hosting, build y despliegue (preview + producción). Cron configurado en `vercel.json` (`/api/cron/newsletter`).
- **Supabase** — base de datos Postgres. Proyecto `newsletter-blog-project` (id `cnulbzfqwfkqvfkmbnxj`), **compartido** entre varios verticales de Immoral Group (incluye `immoralia.es/blog`).

### Justificación del stack

Next.js App Router + Vercel es el stack estándar de los proyectos web de Immoral Group. El motor de blog se centraliza en `@Immoral-marketing/motor-blog` para no duplicar lógica de blog entre verticales — imcontent consume ese paquete en vez de reimplementarlo.

---

## 3. Integraciones externas

### Skills externas

Ninguna skill de IA propia de este repo. El proyecto usa BrianSpec para su ciclo de desarrollo (este bootstrap).

### MCPs (Model Context Protocol)

- **Supabase MCP** — usado durante el desarrollo para inspeccionar/verificar datos del proyecto `newsletter-blog-project` sin necesidad de credenciales locales.
- **ClickUp MCP** — usado para dejar trazabilidad de specs/tareas en el catálogo del equipo (según disponibilidad de autenticación del developer).

### APIs de terceros

- **Supabase** (Postgres + Storage) vía `@Immoral-marketing/motor-blog`.
- **Resend** (`RESEND_API_KEY`) — envío de emails transaccionales/newsletter.
- **Google Tag Manager** (`NEXT_PUBLIC_GTM_ID`) — analítica, condicional, pendiente de ID (ver SPEC-07).

---

## 4. Herramienta de IA principal

**Copiloto declarado:** Claude Code

**Archivos de contexto generados para esta herramienta:**

- `.claude/CLAUDE.md` (ya existente — historial de la migración Vite → Next.js).
- `BRIANSPEC-CONSTITUTION.md`, `PROJECT-CONSTITUTION.md`, `docs/BRIANSPEC-CHEATSHEET.md`, `.brianspec/` — sistema BrianSpec.

---

## 5. Agentes de construcción de este proyecto

Los agentes universales (SPEC, REVIEW, SECURITY) vienen del sistema BrianSpec y operan en cualquier proyecto. Este proyecto no define agentes de construcción propios en `/agents/` todavía — el stack (Next.js + Supabase compartido vía paquete externo) es lo bastante acotado como para trabajarse directamente con FRONTEND-AGENT / BACKEND-AGENT implícitos en el flujo estándar de `brianspec-build`, sin necesidad de definiciones adicionales en esta ronda.

---

## 6. Convenciones de código

### Nomenclatura

Componentes en PascalCase (`HomePage.tsx`), rutas de App Router en minúsculas con guiones (`quienes-somos`), helpers en camelCase (`getVerticalConfig`).

### Estructura de archivos

- `app/` — rutas de Next.js App Router (páginas estáticas + grupo `(blog)` + rutas de API).
- `components/` — componentes; `components/pages-legacy/` contiene las páginas migradas 1:1 desde Figma/Vite.
- `lib/` — utilidades compartidas (`lib/supabase.ts` reexporta el cliente del paquete `motor-blog`, `lib/vertical.ts` resuelve la config del vertical).

### Estilo

Tailwind CSS v4 + utilidades; se preserva la estética 1:1 heredada de la migración (ver `.claude/CLAUDE.md`, sección "Requisitos Estrictos de la Migración").

### Tests

No hay suite de tests automatizados en este repo a fecha de este bootstrap. Ver política en la sección 10.

---

## 7. Modelo de datos

No aplica gestión de modelo de datos propia de este repo: la tabla `articulos` (y `paginas_seo`) vive en el proyecto Supabase compartido `newsletter-blog-project`, gestionado desde el paquete `@Immoral-marketing/motor-blog` y el panel compartido. Este repo solo **lee** esas tablas — no ejecuta migraciones ni define su esquema.

**Regla crítica:** la base de datos es compartida con el vertical de `immoralia.es/blog` (y potencialmente otros verticales futuros). Cualquier cambio de esquema (si alguna vez fuera necesario desde este repo) debe ser **no-destructivo** (nunca `DROP`/`ALTER` que rompa columnas en uso por otro vertical) y debe considerarse su impacto en los demás verticales antes de aplicarse.

---

## 8. Convenciones operativas

### Git

- **Naming de ramas:** `tipo/descripcion-corta` (ej. `seo/brianspec-fase2`).
- **Convención de commits:** mensajes descriptivos en español, referenciando la(s) spec(s) que implementan cuando aplica.
- **Política de PRs:** todo cambio de código pasa por PR contra `main`; no se hace push directo a `main`.

### Despliegue

Vercel, con preview deploy automático por PR y despliegue a producción al mergear a `main`. Dominio de producción: `https://imcontent.es`.

### Variables de entorno

Documentadas en `.env.example`. Las de producción se gestionan en Vercel → Settings → Environment Variables (fuera del repo). Ver SPEC-01 y SPEC-07 para variables actualmente mal configuradas o pendientes.

---

## 9. Restricciones específicas del proyecto

- La base de datos del blog es compartida con `immoralia.es/blog` — ver sección 7.
- El motor de blog (`@Immoral-marketing/motor-blog`) es un paquete externo versionado por separado; cambios en la lógica de listado/ficha de artículo o en su JSON-LD deben proponerse en ese paquete, no duplicarse en este repo.
- La estética de las páginas comerciales heredadas de Figma/Vite debe preservarse 1:1 salvo que una spec indique explícitamente lo contrario.

---

## 10. Cómo aplica BrianSpec a este proyecto

### Comandos disponibles

- `brianspec-spec` → Generar/clarificar specs nuevas
- `brianspec-build` → Implementar specs con revisión automática
- `brianspec-archive` → Cerrar y archivar specs implementadas

### Umbral para spec

Sigue lo definido en `BRIANSPEC-CONSTITUTION.md` (P1). En este proyecto, **requiere spec** todo cambio que:

- Afecte al usuario final o introduzca comportamiento nuevo
- Modifique el modelo de datos
- Toque las variables de entorno que leen `app/sitemap.ts`, `app/robots.txt/route.ts` o `app/llms.txt/route.ts` (superficie SEO crítica)

**NO requiere spec:**

- Hotfixes evidentes (typos, null checks, fixes de regresión menores)
- Refactors internos sin cambio funcional
- Cambios de copy sin cambio de comportamiento
- Cambios exclusivos de estilos que no alteren estructura ni comportamiento

### Política de tests

Este proyecto no tiene tests automatizados a fecha de este bootstrap. La verificación de cambios se hace con `pnpm build` (build de Next.js sin errores) y, cuando aplica, `curl` contra el deploy de preview/producción para verificar comportamiento HTTP real (sitemap, robots, metadata, JSON-LD). Se añadirán tests automatizados cuando una spec futura identifique lógica crítica que los justifique (P9).

---

## 11. Enmiendas a esta Constitution del proyecto

Esta Constitution del proyecto puede modificarse cuando una decisión fundacional cambie (cambio de stack mayor, cambio de owner, cambio de alcance). El cambio se versiona y se anuncia al equipo antes de aplicarse.

Las enmiendas al `BRIANSPEC-CONSTITUTION.md` global siguen su propio proceso, definido en su sección 4. Este proyecto no puede modificar la Constitution global.

---

*Proyecto imcontent-landing — Bootstrap de BrianSpec el 2026-07-13*
