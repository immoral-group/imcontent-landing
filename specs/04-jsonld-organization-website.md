# SPEC-04: JSON-LD Organization/WebSite en el layout raíz

**Versión:** 1.0
**Estado:** aprobada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

No hay ni un solo bloque `application/ld+json` en ninguna página del sitio, ni en el HTML servido en producción ni en el código fuente de este repo. El mínimo estructurado que cualquier sitio debería tener es `Organization` (identidad de la empresa: nombre, URL, logo) y `WebSite` (identidad del sitio, habilita "sitelinks search box" y ayuda a motores de IA a entender el contexto). Esta spec añade ambos al layout raíz (`app/layout.tsx`), que se renderiza en todas las páginas. El JSON-LD `Article` de los posts del blog queda explícitamente fuera de esta spec porque depende del paquete compartido `@Immoral-marketing/motor-blog` (ver Out of scope).

---

## Actores

- **Rastreador de buscador (Google, Bing):** lee el JSON-LD para enriquecer resultados (rich snippets, knowledge panel) y para entender la identidad de la organización detrás del sitio.
- **Rastreador/LLM de IA (GPTBot, ClaudeBot, Perplexity):** usa datos estructurados como señal de contexto fiable sobre quién es imcontent.
- **Desarrollador:** añade el bloque JSON-LD al layout raíz, sin necesidad de repetirlo en cada página.

---

## Flujos principales

### Flujo 1: Renderizado del JSON-LD en cada página

1. Cualquier página del sitio (estática o de blog) se renderiza a través de `app/layout.tsx`.
2. El layout raíz incluye un `<script type="application/ld+json">` con dos objetos (o un array de dos objetos, o `@graph` — ver Plan de implementación) describiendo `Organization` y `WebSite`.
3. El objeto `Organization` incluye al menos `@type: "Organization"`, `name: "imcontent"`, `url` (base de producción) y `logo` (si existe un asset de logo identificable en `public/` o `assets/`).
4. El objeto `WebSite` incluye al menos `@type: "WebSite"`, `name: "imcontent"` y `url`.
5. El rastreador que descarga cualquier página del sitio recibe este bloque, independientemente de qué página concreta esté visitando.

---

## Flujos alternativos / Edge cases

- **No existe un logo identificable en el repo:** se omite el campo `logo` en vez de inventar una URL que no existe (evita un dato estructurado falso, que Google penaliza más que la ausencia del campo).
- **La URL base depende de `NEXT_PUBLIC_APP_URL`:** el JSON-LD debe usar la misma fuente normalizada que SPEC-01 (el helper `lib/site-url.ts`), para no introducir un cuarto punto con el mismo bug de URL mal formada.
- **Página de blog individual:** hereda el JSON-LD Organization/WebSite del layout raíz igual que las páginas estáticas; no se duplica con ningún JSON-LD `Article` (que no existe todavía, ver Out of scope) porque los `@type` son distintos y coexisten sin conflicto.

---

## Criterios de aceptación

- [ ] CA-01: `app/layout.tsx` incluye un `<script type="application/ld+json">` con un objeto `@type: "Organization"` con al menos `name` y `url`.
- [ ] CA-02: El mismo bloque (o uno adicional) incluye un objeto `@type: "WebSite"` con al menos `name` y `url`.
- [ ] CA-03: La `url` usada en ambos objetos se construye con el mismo helper normalizado de `NEXT_PUBLIC_APP_URL` introducido en SPEC-01 (`lib/site-url.ts`), no con una URL hardcodeada distinta.
- [ ] CA-04: El JSON-LD es válido — parsea sin error con `JSON.parse()` sobre el contenido del script.
- [ ] CA-05: `pnpm build` compila sin errores tras el cambio.
- [ ] CA-06: Tras el deploy (o contra preview de Vercel), `curl` a `/` devuelve HTML que contiene `application/ld+json` con `"@type":"Organization"` y `"@type":"WebSite"`.

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

`app/layout.tsx` — añade el `<script type="application/ld+json">` dentro del `<body>` (o `<head>` vía la API de `metadata.other` de Next.js si se prefiere ese mecanismo — ver Plan de implementación).

### Componentes reutilizables

Se propone extraer el JSON-LD a un pequeño componente/función `lib/jsonld.ts` (o similar) que devuelva el objeto ya construido, para poder reutilizarlo el día que el paquete `motor-blog` necesite componerlo con un `Article` (fuera de alcance de esta spec, pero se deja la puerta abierta).

### Breakpoints obligatorios

No aplica — no hay renderizado visual.

### Estándar de calidad visual

No aplica.

---

## API / Endpoints

### Endpoints nuevos

Ninguno.

### Endpoints modificados

Ninguno — el JSON-LD viaja embebido en el HTML de cada página, no es un endpoint separado.

### Contratos de request/response

No aplica.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno — nombre, URL y logo son datos públicos de marketing.

### Validaciones server-side requeridas

Ninguna — el contenido del JSON-LD es estático/determinístico, no depende de input externo. Si en el futuro se enriquece con datos de Supabase, ese cambio requerirá su propia spec y sanitización.

### Autenticación y autorización

No aplica.

### Otros riesgos identificados

- **Riesgo de JSON-LD inválido por escape incorrecto de caracteres:** mitigado usando `JSON.stringify()` para generar el contenido del script (nunca concatenación manual de strings), igual que hace `dangerouslySetInnerHTML` del script de GTM ya existente en el mismo archivo.

*(SECURITY-AGENT aplicará el checklist de `.brianspec/security-checklists.md` sección "Tipo: web-app" durante la revisión.)*

---

## Plan de implementación

### Arquitectura propuesta

En `app/layout.tsx`, construir un objeto JS con los datos de `Organization` y `WebSite` (como array o como `@graph` de un único objeto `@context`), serializarlo con `JSON.stringify()` y renderizarlo en un `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ... }} />` dentro del `<body>` — patrón ya usado en el mismo archivo para el script de GTM, así que no introduce una técnica nueva al codebase.

### Desglose de tareas

1. Confirmar si existe un asset de logo público y estable (ej. en `public/` o `assets/`) para incluir en `Organization.logo`; si no existe, omitir el campo.
2. Construir el objeto JSON-LD combinado (`Organization` + `WebSite`) usando `getBaseUrl()` de `lib/site-url.ts` (introducido en SPEC-01) para la `url`.
3. Renderizar el `<script type="application/ld+json">` en `app/layout.tsx` vía `JSON.stringify()`.
4. Verificar manualmente que el JSON-LD parsea correctamente (CA-04).

### Dependencias con otras specs

- **Depende de SPEC-01:** reutiliza `lib/site-url.ts` para la URL base. Si SPEC-01 no se ha implementado aún, esta spec debe crear temporalmente su propia normalización o esperar a que SPEC-01 esté mergeada primero. Recomendado: implementar SPEC-01 antes o en el mismo PR.

---

## Tests requeridos

### Tests unitarios

No aplica.

### Tests de integración

CA-04 (parseo del JSON) y CA-06 (`curl` post-deploy).

### Tests E2E

No aplica.

---

## Out of scope (explícito)

- **JSON-LD `Article` en los posts del blog.** Este tipo de dato estructurado debería vivir en el paquete compartido `@Immoral-marketing/motor-blog` (que renderiza `app/(blog)/blog/[slug]/page.tsx`), no en este repo — el motor es consumido también por `immoralia.es/blog`, así que la implementación correcta beneficia a ambos verticales a la vez. Se recomienda abrir esta tarea como spec o issue compartido en el repo/paquete del motor de blog, no duplicarla aquí.
- **JSON-LD `BreadcrumbList`** en páginas internas — no forma parte del hallazgo #5 de la auditoría, posible spec futura.
- **JSON-LD `LocalBusiness`** — no hay dirección física relevante para el negocio declarada; se descarta salvo que el negocio lo requiera explícitamente.
- **Logo real de la marca en el JSON-LD** si no existe un asset estable identificado — se documenta como pendiente, no se bloquea la spec por esto (ver CA-01, que no exige `logo` como campo obligatorio).

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial, aprobada directamente para ejecución tras la auditoría SEO del 2026-07-13. | David Navarrete |
