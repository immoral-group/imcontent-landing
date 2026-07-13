import { supabase } from '@/lib/supabase'
import { getVerticalConfig } from '@/lib/vertical'
import { getBaseUrl } from '@/lib/site-url'

/**
 * Contenido de /llms.txt (ruta canónica) y /llm.txt (alias de
 * compatibilidad, ver SPEC-05). Centralizado aquí para no duplicar la
 * consulta a Supabase ni el formateo entre ambas rutas.
 */
export async function getLlmsTxtContent(): Promise<string> {
  const vertical   = await getVerticalConfig()
  const baseUrl    = getBaseUrl()
  const verticalId = process.env.VERTICAL_ID || ''

  const siteName    = vertical?.seo_site_title || 'imcontent'
  const description = vertical?.llm_txt_description ||
    'imcontent es una agencia de contenido audiovisual creado con IA.'

  const { data: articulos, error } = await supabase
    .from('articulos')
    .select('titular, slug, meta_description')
    .eq('vertical_id', verticalId)
    .eq('estado', 'publicado')
    .eq('noindex', false)
    .order('fecha_publicacion', { ascending: false, nullsFirst: false })
    .limit(50)

  if (error) {
    console.error('[llms.txt] Error al consultar articulos:', error.message)
  }

  const articulosList = (articulos || [])
    .map(a =>
      `- [${a.titular}](${baseUrl}/blog/${a.slug})${
        a.meta_description ? ': ' + a.meta_description : ''
      }`
    )
    .join('\n')

  return `# ${siteName}

> ${description}

## Sobre este sitio

- URL: ${baseUrl}
- Idioma: Español

## Uso del contenido

El contenido puede ser indexado y citado con atribución a ${siteName}.

## Artículos recientes

${articulosList}
`
}
