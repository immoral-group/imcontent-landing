/**
 * Base URL pública del sitio, normalizada.
 *
 * `NEXT_PUBLIC_APP_URL` es la fuente de verdad para construir cualquier URL
 * absoluta (canonical, sitemap, robots.txt, llms.txt, JSON-LD...). En
 * producción esta variable puede llegar mal configurada (dominio erróneo,
 * barra final, etc. — ver SPEC-01). Esta función no puede corregir un
 * dominio equivocado, pero sí evita el bug de doble barra (`//`) al
 * concatenar rutas, quitando cualquier barra final antes de usarla.
 */
export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL || ''
  return raw.replace(/\/+$/, '')
}
