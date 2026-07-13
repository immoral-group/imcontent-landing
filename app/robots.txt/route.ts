import { NextResponse } from 'next/server'
import { getVerticalConfig } from '@/lib/vertical'
import { getBaseUrl } from '@/lib/site-url'

export const revalidate = 3600

export async function GET() {
  const vertical = await getVerticalConfig()
  const baseUrl  = getBaseUrl()

  const base = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    `Sitemap: ${baseUrl}/sitemap.xml`,
  ].join('\n')

  const content = vertical?.robots_extra_rules
    ? `${base}\n\n# Reglas adicionales\n${vertical.robots_extra_rules}`
    : base

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
