'use client'

import { motion } from 'motion/react'
import { Mail } from 'lucide-react'
import SubscribeForm from '../SubscribeForm'
import { useBlogConfig } from '@Immoral-marketing/motor-blog/lib/BlogConfigContext'

export default function SubscribeCTA({
  variant = 'large'
}: {
  variant?: 'large' | 'compact' | 'subtle'
}) {
  const { cta } = useBlogConfig()

  if (variant === 'subtle') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{
            background: 'white',
            border: '1px solid var(--blog-card-border)',
          }}
        >
          <div
            className="absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ background: 'var(--blog-accent)' }}
          />
          <div className="relative z-10 flex-1">
            <h3
              className="text-lg md:text-xl tracking-tight mb-1"
              style={{
                color: 'var(--blog-text)',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.01em',
              }}
            >
              {cta.compact?.title || 'Contenido que convierte. Creado con IA.'}
            </h3>
            <p
              className="text-xs md:text-sm"
              style={{
                color: 'var(--blog-text-muted)',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 300,
              }}
            >
              {cta.compact?.description || 'Descubre cómo imcontent puede ayudarte.'}
            </p>
          </div>
          <div className="relative z-10 w-full md:w-auto md:min-w-[320px]">
            <SubscribeForm />
          </div>
        </motion.div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="px-6 mb-16">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl shadow-sm p-8 md:p-10"
            style={{
              background: 'white',
              border: '1px solid var(--blog-card-border)',
            }}
          >
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ background: 'var(--blog-accent)' }}
            />
            <div className="relative">
              <h3
                className="text-2xl md:text-3xl mb-2 tracking-tight"
                style={{
                  color: 'var(--blog-text)',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                }}
              >
                {cta.compact.title}
              </h3>
              <p
                className="mb-6"
                style={{
                  color: 'var(--blog-text-muted)',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 300,
                }}
              >
                {cta.compact.description}
              </p>
              <SubscribeForm />
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="px-6 mb-32"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl shadow-sm p-10 md:p-16"
          style={{
            background: 'white',
            border: '1px solid var(--blog-card-border)',
          }}
        >
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 animate-pulse"
            style={{ background: 'var(--blog-accent)' }}
          />

          <div className="relative max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{
                background: 'color-mix(in srgb, var(--blog-accent) 10%, transparent)',
              }}
            >
              <Mail className="w-3.5 h-3.5" style={{ color: 'var(--blog-accent)' }} />
              <span
                className="text-xs tracking-[0.2em] uppercase"
                style={{
                  color: 'var(--blog-accent)',
                  fontFamily: 'Lexend, sans-serif',
                  fontWeight: 300,
                }}
              >
                {cta.badge}
              </span>
            </div>

            <h2
              className="text-4xl md:text-5xl text-black leading-[1.05] tracking-tight mb-6"
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 100,
                letterSpacing: '-0.025em',
              }}
            >
              {cta.title}
              <br />
              <span
                className="font-black"
                style={{ color: 'var(--blog-accent)' }}
              >
                {cta.titleAlt}
              </span>
            </h2>

            <p
              className="text-lg mb-10 leading-relaxed max-w-xl"
              style={{
                color: 'var(--blog-text-muted)',
                fontFamily: 'Lexend, sans-serif',
                fontWeight: 300,
              }}
            >
              {cta.description}
            </p>

            <SubscribeForm />

            {cta.stats && cta.stats.length > 0 && (
              <div className="mt-8 flex items-center gap-4 text-xs"
                   style={{ color: 'var(--blog-text-muted)' }}>
                {cta.stats.map((stat: string, i: number) => (
                  <>
                    {i > 0 && (
                      <span key={`sep-${i}`} className="w-px h-3 bg-black/15" />
                    )}
                    <span key={stat} className="flex items-center gap-2">
                      {i === 0 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: 'var(--blog-accent)' }}
                        />
                      )}
                      <span style={{ fontFamily: 'Lexend, sans-serif', fontWeight: 300 }}>
                        {stat}
                      </span>
                    </span>
                  </>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
