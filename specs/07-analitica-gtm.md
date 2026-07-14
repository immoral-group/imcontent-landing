# SPEC-07: Analítica — GA4 directo (gtag.js)

**Versión:** 2.0
**Estado:** aprobada — implementada
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-14
**Owner:** David Navarrete

---

## Descripción

`app/layout.tsx` soportaba GTM de forma condicional (`NEXT_PUBLIC_GTM_ID`), pero la variable nunca se configuró en Vercel — confirmado con curl: cero `gtag`/`GTM-` en el HTML servido. Esta spec sustituye ese bloque condicional (nunca activado, código muerto) por el snippet directo de GA4 (`gtag.js`, sin GTM de por medio).

**Decisión de mecanismo (14/07/2026):** GA4 directo, no GTM — mismo patrón que se decidió para immoral.es (SPEC-06 de ese repo) y que ya usaba el Catálogo de Procesos (SPEC-18, decisión D1). Resuelve también la ambigüedad de doble fuente documentada en la v1.1 de esta spec (variable de entorno vs. `verticales_panel.google_tag_manager_id` del panel admin): al no usar GTM en este repo, no hay conflicto posible con esa vía — si en el futuro se activa `google_tag_manager_id` desde el panel para este vertical, coexistiría con GA4 directo sin pisarse (son mecanismos independientes, uno inyecta `gtag.js` puro, el otro `gtm.js`).

**ID de medición usado:** `G-WR0VBSQ3WF` — propiedad GA4 **"imcontent.es"**, creada el 14/07/2026 (nueva, sin histórico previo — a diferencia de immoral.es, no había ninguna propiedad existente para este dominio).

---

## Actores

- **Administrador de analítica (David/Julián):** consulta los datos de GA4.
- **Visitante del sitio:** su navegación se registra de forma anonimizada/agregada en GA4 (sujeto a política de cookies/consentimiento — ver Notas de seguridad).
- **Google Analytics (gtag.js):** script cargado directamente vía `next/script`, sin intermediario.

---

## Flujos principales

### Flujo 1: Carga del snippet gtag.js

1. El visitante carga cualquier página del sitio.
2. `app/layout.tsx` renderiza dos `<Script>` de `next/script` con `strategy="afterInteractive"`: el primero carga `https://www.googletagmanager.com/gtag/js?id=G-WR0VBSQ3WF`, el segundo inicializa `dataLayer` y llama a `gtag('config', 'G-WR0VBSQ3WF')`.
3. Se registra una sesión en la propiedad GA4 "imcontent.es".

---

## Flujos alternativos / Edge cases

- **`TrackingInjector` del motor de blog (`@Immoral-marketing/motor-blog`):** sigue ahí, sin cambios, leyendo `verticales_panel.google_tag_manager_id` (hoy `null` para imcontent). Al ser GA4 directo un mecanismo independiente (no GTM), no hay riesgo de doble carga aunque ese campo se configure en el futuro — quedaría como una capa de GTM adicional, no conflictiva. Si en el futuro se decide activarlo, revisar que no se dupliquen eventos de pageview entre ambos mecanismos.
- **Consentimiento de cookies:** no hay banner ni Consent Mode v2 activo — mismo riesgo legal ya documentado en immoral.es SPEC-06. No bloquea esta spec (decisión explícita de priorizar tener datos ya), queda como tarea pendiente separada.

---

## Criterios de aceptación

- [x] CA-01: El snippet de `gtag.js` está en `app/layout.tsx` con el ID real `G-WR0VBSQ3WF` (no placeholder).
- [ ] CA-02 (post-deploy): `curl https://imcontent.es/` devuelve HTML que contiene `googletagmanager.com/gtag/js?id=G-WR0VBSQ3WF`.
- [ ] CA-03 (post-deploy): en el panel de GA4 (vista en tiempo real de la propiedad "imcontent.es"), se observan sesiones entrando desde imcontent.es.
- [ ] CA-04: build de Next.js sin errores con el snippet instalado (verificar en preview de Vercel — el build local completo sigue bloqueado por falta de token de GitHub Packages, ver PR #1 original).

---

## Notas de seguridad

### Datos sensibles involucrados

El ID de medición no es secreto (viaja en el HTML público). Hardcodeado directamente en `app/layout.tsx` en vez de vía variable de entorno — decisión consciente: es un dato público, y evita depender de que la variable esté bien configurada en Vercel (la lección del día de ayer con `NEXT_PUBLIC_APP_URL` mal configurada motiva esta simplificación).

### Otros riesgos identificados

- 🟠 Sin gestor de consentimiento de cookies — mismo riesgo que en immoral.es SPEC-06, no resuelto aquí.

---

## Plan de implementación

### Desglose de tareas

1. ✅ Sustituir el bloque condicional de GTM (nunca activado) por el snippet de `gtag.js` en `app/layout.tsx`.
2. ✅ Limpiar `.env.example`: eliminada la entrada `NEXT_PUBLIC_GTM_ID` (ya no aplica).
3. Commit con autor verificado (`team@immoral.es`) + push a `master`.
4. Post-deploy: verificar CA-02 y CA-03.

---

## Out of scope (explícito)

- Configurar eventos de conversión en GA4 — trabajo de analítica posterior.
- Activar `verticales_panel.google_tag_manager_id` para este vertical — decisión futura si se necesita GTM para otros píxeles.
- Banner de consentimiento de cookies.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial. Marcada como draft — bloqueada, pendiente del ID de GTM/GA4. | David Navarrete |
| 1.1 | 2026-07-13 | Auditoría con Claude Opus: descubierto `TrackingInjector` como segunda fuente posible de GTM. Ampliados CAs. | David Navarrete |
| 2.0 | 2026-07-14 | **Desbloqueada y reescrita.** Decisión: GA4 directo, no GTM (coherente con immoral.es y el Catálogo). ID `G-WR0VBSQ3WF` de propiedad GA4 nueva "imcontent.es". Sustituido el bloque condicional de GTM (código muerto, nunca activado) por `gtag.js` directo. Limpiado `.env.example`. | David Navarrete + Claude |
