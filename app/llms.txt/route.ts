import { NextResponse } from 'next/server'
import { getLlmsTxtContent } from '@/lib/llms-txt'

export const revalidate = 3600

export async function GET() {
  const content = await getLlmsTxtContent()

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
