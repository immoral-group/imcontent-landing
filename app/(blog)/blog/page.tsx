import { supabase }   from '@/lib/supabase'
import BlogHero       from '@/components/blog/BlogHero'
import BlogList       from '@/components/blog/BlogList'
import SubscribeCTA   from '@/components/blog/SubscribeCTA'
import { blogConfig } from '@/lib/blog-config'
import { getBaseUrl } from '@/lib/site-url'
import type { Metadata } from 'next'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const title       = `Blog | ${blogConfig.siteName}`
  const description = blogConfig.hero.subtitle

  return {
    title,
    description,
    alternates: {
      canonical: `${getBaseUrl()}/blog`,
    },
    openGraph: {
      title,
      description,
      url:      `${getBaseUrl()}/blog`,
      siteName: blogConfig.siteName,
      type:     'website',
    },
  }
}

async function getArticulos() {
  const { data } = await supabase
    .from('articulos')
    .select('id, titular, slug, meta_description, imagen_url, categoria, fecha_publicacion')
    .eq('vertical_id', process.env.VERTICAL_ID!)
    .eq('estado', 'publicado')
    .eq('noindex', false)
    .order('fecha_publicacion', { ascending: false, nullsFirst: false })
    .limit(90)
  return data || []
}

export default async function BlogPage() {
  const articulos = await getArticulos()

  return (
    <main className="relative">
      <BlogHero count={articulos.length} />
      {articulos.length === 0 ? (
        <EmptyState />
      ) : (
        <BlogList articulos={articulos} />
      )}
      <SubscribeCTA />
    </main>
  )
}

function EmptyState() {
  const { emptyState } = blogConfig
  return (
    <section className="px-6 mb-32">
      <div className="max-w-3xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(149,32,234,0.1), rgba(149,32,234,0.05))',
            border:     '1px solid color-mix(in srgb, var(--blog-accent) 20%, transparent)',
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'color-mix(in srgb, var(--blog-accent) 10%, transparent)' }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{
                background: 'color-mix(in srgb, var(--blog-accent) 10%, transparent)',
                border:     '1px solid color-mix(in srgb, var(--blog-accent) 30%, transparent)',
              }}
            >
              <span
                className="w-3 h-3 rounded-full animate-pulse"
                style={{ background: 'var(--blog-accent)' }}
              />
            </div>
            <h2
              className="text-3xl md:text-4xl mb-4 tracking-tight"
              style={{
                color:       'var(--blog-text)',
                fontFamily:  'Lexend, sans-serif',
                fontWeight:  900,
                letterSpacing: '-0.02em',
              }}
            >
              {emptyState.title}
            </h2>
            <p
              className="max-w-md mx-auto"
              style={{
                color:      'var(--blog-text-muted)',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 300,
              }}
            >
              {emptyState.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
