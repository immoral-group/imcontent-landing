import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { getVerticalConfig } from '@/lib/vertical'
import { getBaseUrl } from '@/lib/site-url'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl    = getBaseUrl()
  const verticalId = process.env.VERTICAL_ID || ''

  // `paginas_seo.vertical_id` referencia `verticales_panel.id` — un espacio
  // de IDs distinto al de `process.env.VERTICAL_ID` (que referencia
  // `verticales.id`, el mismo espacio que usa `articulos.vertical_id`).
  // Hay que resolver primero el id propio del panel. Ver LL-001.
  const vertical = await getVerticalConfig()

  const { data: paginas, error: paginasError } = await supabase
    .from('paginas_seo')
    .select('path, updated_at')
    .eq('vertical_id', vertical?.id || '')
    .eq('noindex', false)

  if (paginasError) {
    console.error('[sitemap] Error al consultar paginas_seo:', paginasError.message)
  }

  const { data: articulos, error: articulosError } = await supabase
    .from('articulos')
    .select('slug, fecha_publicacion')
    .eq('vertical_id', verticalId)
    .eq('estado', 'publicado')
    .eq('noindex', false)
    .order('fecha_publicacion', { ascending: false, nullsFirst: false })
    .limit(1000)

  if (articulosError) {
    console.error('[sitemap] Error al consultar articulos:', articulosError.message)
  }

  const paginasEntries: MetadataRoute.Sitemap = (paginas || []).map(p => ({
    url:             `${baseUrl}${p.path}`,
    lastModified:    new Date(p.updated_at),
    changeFrequency: 'monthly' as const,
    priority:        p.path === '/' ? 1.0 : 0.6,
  }))

  const articulosEntries: MetadataRoute.Sitemap = (articulos || []).map(a => ({
    url:             `${baseUrl}/blog/${a.slug}`,
    lastModified:    new Date(a.fecha_publicacion || Date.now()),
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }))

  return [...paginasEntries, ...articulosEntries]
}
