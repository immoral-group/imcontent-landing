# SPEC-08: Alta y verificación en Google Search Console

**Versión:** 1.1
**Estado:** draft — acción manual, fuera del alcance de este repo
**Tipo de proyecto:** web-app
**Última actualización:** 2026-07-13
**Owner:** David Navarrete

---

## Descripción

imcontent.es no está dado de alta en Google Search Console: no hay archivo ni meta tag de verificación, y el dominio no está en la whitelist del MCP compartido de GSC. Sin esto, no hay visibilidad de cómo Google rastrea e indexa el sitio, ni forma de enviar el sitemap formalmente ni de detectar errores de indexación. El trabajo es mayormente manual/infraestructura — el único cambio de código en este repo es la subida de un archivo HTML de verificación a `public/` (método probado en Immoral, ver Contexto operativo abajo).

**Contexto operativo importante** (doc ClickUp `knvz4-82755`, página "03 — Infraestructura compartida"): en Immoral, el método probado y recomendado para verificar propiedades en GSC es **archivo HTML en `public/`**. La verificación por DNS/TXT en el proveedor de dominios ha dado problemas en experiencias previas del equipo, así que se evita. Para Next.js con Vercel, colocar el archivo en `public/googleXXXXXXXX.html` es directo y no requiere código adicional (equivalente a la ruta HTML estática que Next.js sirve tal cual desde `public/`).

---

## Actores

- **David Navarrete (o quien tenga acceso a la cuenta de Google Search Console del equipo):** crea la propiedad y la verifica.
- **Administrador de DNS o de Vercel (si se verifica por DNS TXT):** añade el registro TXT.
- **Desarrollador (solo si se verifica por meta tag):** añadiría el meta tag de verificación a `app/layout.tsx`.

---

## Flujos principales

### Flujo 1: Alta y verificación (trabajo mayormente manual)

1. Crear la propiedad `https://imcontent.es` en Google Search Console **por prefijo URL** (no modo Dominio — modo Dominio exige DNS TXT, que el equipo evita, ver Contexto operativo en Descripción).
2. Google entrega un archivo `googleXXXXXXXX.html` con un token único.
3. Colocar ese archivo en `public/googleXXXXXXXX.html` del repo, commit y push. Vercel despliega automáticamente.
4. Pulsar "Verificar" en el panel de GSC.
5. Añadir la Service Account `gsc-mcp@informes-immoral.iam.gserviceaccount.com` como **Propietario** (no "Completo", ver nota abajo) en GSC → Configuración → Usuarios y permisos.
6. Enviar el sitemap (`https://imcontent.es/sitemap.xml`, corregido por SPEC-01 y SPEC-02) desde el panel de GSC → Sitemaps.
7. Confirmar que el sitemap aparece como **Success**.
8. Añadir `https://imcontent.es/` a `GSC_ALLOWED_SITES` del `.env` del contenedor `/opt/gsc-mcp/` en el VPS `srv1596187` (Hostinger) y ejecutar `docker compose up -d --build`. Reconectar el conector de Claude.ai si es necesario tras el reinicio.

---

## Flujos alternativos / Edge cases

- **Rol "Propietario" vs "Completo" para la Service Account:** debe ser Propietario. Con "Completo" se pueden leer datos pero la Indexing API devuelve 403 al solicitar indexaciones (lección aprendida, doc ClickUp `knvz4-82755` página 03).
- **Archivo de verificación mal desplegado por caché de Vercel:** tras el commit, verificar con `curl https://imcontent.es/googleXXXXXXXX.html` que devuelve 200 antes de pulsar "Verificar" en GSC. Si devuelve 404, esperar redeploy completo o forzarlo desde el dashboard.
- **Modo Dominio (DNS TXT):** descartado deliberadamente. El equipo evita DNS TXT por experiencia previa en IONOS (ver Contexto operativo en Descripción). Solo considerar si el prefijo URL con archivo HTML falla por algún motivo no previsto.

---

## Criterios de aceptación

- [ ] CA-01a (verificable localmente/en preview): Existe un archivo `public/googleXXXXXXXX.html` commiteado y desplegado. `curl https://imcontent.es/googleXXXXXXXX.html` devuelve 200 con el contenido esperado (`google-site-verification: googleXXXXXXXX.html`).
- [ ] CA-01: La propiedad `https://imcontent.es` (modo prefijo URL) existe y aparece como **verificada** en Google Search Console.
- [ ] CA-02: La Service Account `gsc-mcp@informes-immoral.iam.gserviceaccount.com` aparece con rol **Propietario** (no "Completo") en GSC → Usuarios y permisos de la propiedad `https://imcontent.es`.
- [ ] CA-03: El sitemap `https://imcontent.es/sitemap.xml` está enviado desde el panel de GSC y aparece como **Success** (requiere SPEC-01 y SPEC-02 aplicadas previamente para que el sitemap tenga contenido válido).
- [ ] CA-04: `https://imcontent.es/` aparece en el valor de `GSC_ALLOWED_SITES` del `.env` del contenedor `/opt/gsc-mcp/` en el VPS `srv1596187`.
- [ ] CA-05: Una consulta de prueba con `gsc_list_sitemaps` sobre `https://imcontent.es/` desde el MCP compartido devuelve datos sin error de "sitio no autorizado".

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

1. **[Manual]** Crear la propiedad `https://imcontent.es` en modo prefijo URL en GSC. Descargar el archivo `googleXXXXXXXX.html`.
2. **[Código — mínimo]** Añadir `public/googleXXXXXXXX.html` al repo, commit y push. Vercel despliega automáticamente.
3. **[Manual]** Pulsar "Verificar" en GSC una vez el archivo esté servido en producción.
4. **[Manual]** Añadir `gsc-mcp@informes-immoral.iam.gserviceaccount.com` como Propietario (no "Completo") en GSC → Configuración → Usuarios y permisos.
5. **[Manual]** Enviar el sitemap `https://imcontent.es/sitemap.xml` desde el panel de GSC.
6. **[Manual]** Acceder por SSH al VPS `srv1596187` (Hostinger), editar `/opt/gsc-mcp/.env` añadiendo `https://imcontent.es/` a `GSC_ALLOWED_SITES`, ejecutar `docker compose up -d --build`.
7. **[Manual]** Reconectar el conector "Google Search Console - MCP" en Claude.ai si es necesario tras el reinicio.
8. **[Verificación]** `gsc_list_sitemaps` sobre `https://imcontent.es/` desde el MCP devuelve datos.

### Dependencias con otras specs

- **Depende de SPEC-01 y SPEC-02:** el sitemap debe estar corregido (URLs con dominio correcto y contenido no vacío) antes de enviarlo a GSC — enviarlo roto generaría errores de indexación reales en el panel que luego habría que limpiar. La SPEC-01 depende además de un cambio manual en Vercel (`NEXT_PUBLIC_APP_URL`), así que el orden real es: 1) fix env en Vercel → 2) merge de PR con SPEC-01/02 → 3) esta SPEC.

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
| 1.1 | 2026-07-13 | Auditoría con Claude Opus. Corregida contradicción con doc del equipo: la SPEC recomendaba DNS TXT, pero la página "03 — Infraestructura compartida" del doc `knvz4-82755` dice explícitamente que el método probado en Immoral es archivo HTML en `public/` (DNS TXT descartado por experiencia previa en IONOS). Cambiado a verificación por prefijo URL + archivo HTML, con un mínimo cambio de código (commit del archivo en `public/`). Añadidos los detalles concretos que faltaban: email exacto de la Service Account (`gsc-mcp@informes-immoral.iam.gserviceaccount.com`), ruta del `.env` del VPS (`/opt/gsc-mcp/.env`), nombre del VPS (`srv1596187`), formato de valor de `GSC_ALLOWED_SITES` (URL con protocolo y barra final), rol correcto ("Propietario" no "Completo") y paso de reconectar el conector de Claude.ai. Añadidos CA-01a (verificable localmente) y CA-04/CA-05. | David Navarrete |
