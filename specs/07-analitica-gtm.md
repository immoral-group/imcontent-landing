# SPEC-07: Analítica — configurar NEXT_PUBLIC_GTM_ID

**Versión:** 1.1
**Estado:** draft — bloqueada, pendiente de ID de GTM/GA4 de Julián o David
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

`app/layout.tsx` ya soporta Google Tag Manager de forma condicional: si `process.env.NEXT_PUBLIC_GTM_ID` existe, inyecta el script de GTM (`gtm-root`) que cubre todo el dominio. Confirmado con curl contra producción: cero `gtag`/`GTM-` en el HTML servido porque la variable no está configurada en Vercel. El código no necesita ningún cambio — solo falta el contenedor GTM (o ID de GA4, según se decida) y configurar la variable en Vercel. Esta spec queda bloqueada explícitamente hasta recibir ese ID — no se debe inventar ni usar un ID de placeholder.

---

## Actores

- **Julián o David:** debe proporcionar el ID real del contenedor GTM (formato `GTM-XXXXXXX`) o, si se decide usar GA4 directo, el Measurement ID (`G-XXXXXXXXXX`) y confirmar cuál de los dos mecanismos se usa.
- **Administrador de Vercel:** configura la variable `NEXT_PUBLIC_GTM_ID` en Production una vez se tenga el ID.
- **Next.js (runtime):** ya lee la variable condicionalmente — no requiere cambio de código.

---

## Flujos principales

### Flujo 1 (bloqueado, pendiente del ID)

1. Julián o David crea (o identifica) el contenedor GTM para imcontent.es y comunica el ID.
2. Un administrador con acceso a Vercel configura `NEXT_PUBLIC_GTM_ID=<ID recibido>` en Settings → Environment Variables → Production.
3. Tras el siguiente deploy, `app/layout.tsx` inyecta automáticamente el script de GTM (ya implementado, condicional a la variable) en todas las páginas.
4. Se verifica en el HTML servido (`curl` o inspección del navegador) que el script de GTM aparece, y en el panel de GTM/GA4 que llegan eventos de pageview.

---

## Flujos alternativos / Edge cases

- **Se decide usar GA4 directo en vez de GTM:** requeriría una spec nueva (o una revisión de ésta) porque el código actual solo soporta la variable `NEXT_PUBLIC_GTM_ID` y el snippet de GTM, no un snippet de gtag.js directo — son mecanismos de inyección distintos.
- **El ID llega pero corresponde a un contenedor de otro vertical/proyecto por error:** se debe confirmar explícitamente con Julián/David que el ID pertenece específicamente al contenedor de imcontent.es antes de configurarlo en Vercel Production.
- **Doble carga de GTM vía `TrackingInjector` del motor de blog:** `app/layout.tsx` renderiza `<TrackingInjector verticalId={process.env.VERTICAL_ID} />` del paquete `@Immoral-marketing/motor-blog`. Ese componente lee `verticales_panel.google_tag_manager_id` de Supabase y, si existe, inyecta su propio snippet de GTM. Confirmado en la BD compartida (2026-07-13): el registro `verticales_panel` de imcontent tiene `google_tag_manager_id = null` — el `TrackingInjector` no está inyectando nada hoy. **Riesgo:** si en el futuro alguien configura ese campo desde el panel admin, se solaparía con `NEXT_PUBLIC_GTM_ID`, generando doble tracking. Documentar en el PR que las dos fuentes de GTM ID (variable de entorno + campo en `verticales_panel`) deben estar coordinadas — el equipo debe decidir cuál es la fuente de verdad. Recomendación provisional: usar solo `verticales_panel.google_tag_manager_id` (gestionado desde el panel admin, coherente con `immoralia.es/blog` que usa `GTM-W6R3TRSN` por esa vía) y no configurar `NEXT_PUBLIC_GTM_ID` en Vercel. Confirmar con Julián antes de decidir.
- **Consentimiento de cookies:** no hay banner ni Consent Mode v2 activo. Instalar GTM en producción sin gestor de consentimiento tiene el mismo riesgo legal RGPD/LSSI que en immoral SPEC-06 — documentado aquí como riesgo, no como bloqueo de esta SPEC (que ya está bloqueada por el ID). Debe abordarse antes de que GTM entre en producción real.

---

## Criterios de aceptación

- [ ] CA-01: Julián o David proporciona un ID de GTM válido (formato `GTM-XXXXXXX`) específico para imcontent.es **y confirma explícitamente cuál es la fuente de verdad**: (a) `NEXT_PUBLIC_GTM_ID` en Vercel, o (b) `verticales_panel.google_tag_manager_id` en Supabase (vía panel admin, misma vía que Immoralia). Solo una — no ambas simultáneamente.
- [ ] CA-02: El ID se configura por la vía elegida en CA-01 (acción manual, fuera de este repo).
- [ ] CA-03: Tras el deploy, `curl https://imcontent.es/` devuelve exactamente **un** script de GTM (no dos: la vía no elegida debe permanecer sin configurar).
- [ ] CA-04: En el panel de GTM/GA4, se observan eventos de pageview entrando desde imcontent.es en las 24h posteriores a la configuración.
- [ ] CA-05 (defecto seguro): mientras esta SPEC esté en `draft`, ni `NEXT_PUBLIC_GTM_ID` en Vercel ni `verticales_panel.google_tag_manager_id` en Supabase para el vertical de imcontent tienen un valor — ambos siguen `null`/vacío.

---

## Modelo de datos

No aplica.

---

## UI / Páginas afectadas

No aplica — el código de `app/layout.tsx` ya existe y no requiere cambios; esta spec es 100% de configuración.

---

## API / Endpoints

No aplica.

---

## Notas de seguridad

### Datos sensibles involucrados

El ID de GTM/GA4 no es secreto (viaja en el HTML público de cualquier página), pero debe corresponder al contenedor correcto del vertical de imcontent — un ID equivocado mezclaría datos de analítica entre proyectos.

### Validaciones server-side requeridas

No aplica.

### Autenticación y autorización

No aplica.

### Otros riesgos identificados

Ninguno — código ya implementado y ya revisado en rondas anteriores (fuera del alcance de esta spec).

---

## Plan de implementación

### Arquitectura propuesta

Ninguna — no hay cambio de código. Ver Flujo 1.

### Desglose de tareas

1. **[BLOQUEANTE, fuera de este repo]** Julián o David proporciona el ID de GTM de imcontent.es.
2. **[Fuera de este repo]** Configurar `NEXT_PUBLIC_GTM_ID` en Vercel Production.
3. **[Verificación]** `curl` post-deploy + revisión del panel de GTM/GA4.

### Dependencias con otras specs

Ninguna.

---

## Tests requeridos

No aplica — spec de configuración, no de código.

---

## Out of scope (explícito)

- Configurar goals/conversiones dentro de GTM/GA4 — trabajo de analítica, no de este repo.
- Migrar a GA4 directo sin GTM como intermediario — requeriría cambio de código y spec propia si se decide ese camino.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial. Marcada como draft — bloqueada, pendiente del ID de GTM/GA4 de Julián o David. No se implementa código en esta ronda. | David Navarrete |
| 1.1 | 2026-07-13 | Auditoría con Claude Opus. Descubrimiento crítico: `app/layout.tsx` ya renderiza `<TrackingInjector />` del paquete `@Immoral-marketing/motor-blog`, que puede inyectar GTM a partir de `verticales_panel.google_tag_manager_id` (Supabase). Verificado en BD: hoy `null` para imcontent, así que no hay doble tracking, pero existe la vía. Añadido edge case, ampliado CA-01 para exigir elección explícita entre las dos fuentes (variable de entorno vs BD), CA-03 revisado para verificar que solo hay UN script de GTM, y añadido CA-05 de defecto seguro. Añadido edge case sobre consentimiento de cookies (mismo riesgo legal que immoral SPEC-06). | David Navarrete |
