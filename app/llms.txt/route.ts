import { NextResponse } from 'next/server'
import { getLlmsTxtContent } from '@/lib/llms-txt'

// force-dynamic: ruta nueva; verificado en producción el 2026-07-13 que con
// solo `revalidate` el build inicial la deja devolviendo 404 cacheado
// (X-Matched-Path: /404, X-Vercel-Cache: HIT) — /llm.txt (alias, mismo código)
// sí funciona porque ya existía antes de este cambio de convención de caché.
export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
  const content = await getLlmsTxtContent()

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
