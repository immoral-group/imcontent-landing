# SPEC-07: Analítica — configurar NEXT_PUBLIC_GTM_ID

**Versión:** 1.0
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

---

## Criterios de aceptación

- [ ] CA-01: Julián o David proporciona un ID de GTM válido (formato `GTM-XXXXXXX`) específico para imcontent.es.
- [ ] CA-02: La variable `NEXT_PUBLIC_GTM_ID` se configura en Vercel → Settings → Environment Variables → Production con ese valor (acción manual, fuera de este repo).
- [ ] CA-03: Tras el deploy, `curl https://imcontent.es/` devuelve HTML que contiene `googletagmanager.com/gtm.js?id=GTM-` con el ID configurado.
- [ ] CA-04: En el panel de GTM/GA4, se observan eventos de pageview entrando desde imcontent.es en las 24h posteriores a la configuración.

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
