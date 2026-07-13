import { NextResponse } from 'next/server'
import { getLlmsTxtContent } from '@/lib/llms-txt'

// Alias de compatibilidad. La ruta canónica es /llms.txt (ver SPEC-05).
// force-dynamic por coherencia con /llms.txt (ver esa ruta para el porqué).
export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
  const content = await getLlmsTxtContent()

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
