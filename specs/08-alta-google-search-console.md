# SPEC-08: Alta y verificación en Google Search Console

**Versión:** 1.0
**Estado:** draft — acción manual, fuera del alcance de este repo
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

imcontent.es no está dado de alta en Google Search Console: no hay archivo ni meta tag de verificación, y el dominio no está en la whitelist del MCP compartido de GSC. Sin esto, no hay visibilidad de cómo Google rastrea e indexa el sitio, ni forma de enviar el sitemap formalmente ni de detectar errores de indexación. Esta spec documenta el trabajo pendiente, que es 100% manual/infraestructura — no hay código que implementar en este repo (salvo que, al decidir el método de verificación, se elija meta tag en vez de DNS TXT, en cuyo caso sí habría un cambio mínimo de código, ver Edge cases).

---

## Actores

- **David Navarrete (o quien tenga acceso a la cuenta de Google Search Console del equipo):** crea la propiedad y la verifica.
- **Administrador de DNS o de Vercel (si se verifica por DNS TXT):** añade el registro TXT.
- **Desarrollador (solo si se verifica por meta tag):** añadiría el meta tag de verificación a `app/layout.tsx`.

---

## Flujos principales

### Flujo 1: Alta y verificación (trabajo manual)

1. Crear la propiedad `imcontent.es` en Google Search Console (modo Dominio, recomendado, o modo prefijo URL `https://imcontent.es`).
2. Elegir método de verificación: DNS TXT (recomendado — desacoplado del código y del ciclo de deploy, mismo patrón usado en el proyecto de referencia `immoralia-catalogo-procesos` SPEC-14) o meta tag HTML.
3. Si DNS TXT: copiar el valor que entrega Google y añadirlo como registro TXT en el DNS de `imcontent.es`. Esperar propagación. Confirmar verificación en GSC.
4. Si meta tag: añadir el meta tag de verificación al `<head>` (requeriría un pequeño cambio de código en `app/layout.tsx` o vía `metadata.verification` de Next.js — en ese caso, esta spec pasaría a `aprobada` con un CA de código añadido antes de implementarse).
5. Una vez verificado, enviar el sitemap (`https://imcontent.es/sitemap.xml`, corregido por SPEC-02) desde el panel de GSC → Sitemaps.
6. Confirmar que el sitemap aparece como **Success**.

---

## Flujos alternativos / Edge cases

- **Verificación falla por DNS no propagado:** se reintenta tras esperar propagación (hasta 24h). No bloquea nada más del proyecto.
- **Se decide verificar por meta tag en vez de DNS:** esta spec debe reescribirse a estado `aprobada` con criterios de aceptación de código (meta tag en `app/layout.tsx`) antes de poder implementarse — hoy sigue en `draft` porque el método no está decidido.
- **El MCP compartido de GSC del equipo no tiene el dominio en whitelist:** solicitar a quien administre ese MCP que añada `imcontent.es` una vez la propiedad esté verificada, para poder usar las herramientas de análisis continuo de GSC (fuera de alcance de esta spec).

---

## Criterios de aceptación

- [ ] CA-01: La propiedad `imcontent.es` existe y aparece como **verificada** en Google Search Console.
- [ ] CA-02: El sitemap `https://imcontent.es/sitemap.xml` está enviado desde el panel de GSC y aparece como **Success**.
- [ ] CA-03: El dominio `imcontent.es` está añadido a la whitelist del MCP compartido de GSC del equipo (si aplica el uso de ese MCP para este proyecto).

---

## Modelo de datos

No aplica.

---

## UI / Páginas afectadas

No aplica salvo que se elija verificación por meta tag (ver Edge cases) — en ese caso, cambio mínimo en `app/layout.tsx`, a definir cuando se decida el método.

---

## API / Endpoints

No aplica.

---

## Notas de seguridad

### Datos sensibles involucrados

Ninguno.

### Validaciones server-side requeridas

No aplica.

### Autenticación y autorización

El acceso a la cuenta de Google Search Console del equipo debe estar restringido a las personas que ya la administran — no se comparte fuera de este grupo.

### Otros riesgos identificados

Ninguno.

---

## Plan de implementación

### Arquitectura propuesta

No aplica — trabajo manual/infraestructura.

### Desglose de tareas

1. **[Manual]** Crear propiedad en GSC.
2. **[Manual]** Verificar (DNS TXT recomendado).
3. **[Manual]** Enviar sitemap.
4. **[Manual, opcional]** Añadir el dominio al MCP compartido de GSC.

### Dependencias con otras specs

- **Depende de SPEC-01 y SPEC-02:** el sitemap debe estar corregido (URLs con dominio correcto y contenido no vacío) antes de enviarlo a GSC — enviarlo roto generaría errores de indexación reales en el panel que luego habría que limpiar.

---

## Tests requeridos

No aplica.

---

## Out of scope (explícito)

- Análisis continuo de datos de GSC (queries, CTR, posiciones) — spec futura, solo tiene sentido tras 2-4 semanas de datos acumulados desde la verificación.
- Configuración de Bing Webmaster Tools u otros paneles de buscadores — no mencionado en la auditoría, fuera de esta ronda.

---

## Historial

| Versión | Fecha | Cambio | Autor |
|---|---|---|---|
| 1.0 | 2026-07-13 | Versión inicial. Marcada como draft — acción manual, fuera del alcance de este repo. No se implementa código en esta ronda. | David Navarrete |
