'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import SubscribeForm from '../SubscribeForm'
import { motion, AnimatePresence } from 'motion/react'

export default function SubscribePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [timePassed, setTimePassed] = useState(false)
  const [scrollPassed, setScrollPassed] = useState(false)

  // Track window resizing and initial state on mount
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 1. Time condition: 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimePassed(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  // 2. Scroll condition: 300px
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 300) {
        setScrollPassed(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial position
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Helper to retrieve cookie values
  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  // 3. Trigger showing the popup once conditions are met
  useEffect(() => {
    if (!timePassed || !scrollPassed) return

    const isSubscribed = getCookie('newsletter_subscribed') === 'true'
    const isDismissed = getCookie('newsletter_slidein_dismissed') === 'true'
    
    // Stop showing if subscribed or dismissed recently
    if (isSubscribed || isDismissed) return

    if (isMobile) {
      // Mobile: Automatically slides up once conditions are met
      setIsOpen(true)
    } else {
      // Desktop: Listen for exit intent (mouseleave at the top)
      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY < 20) {
          setIsOpen(true)
        }
      }
      document.addEventListener('mouseleave', handleMouseLeave)
      return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [timePassed, scrollPassed, isMobile])

  const handleClose = () => {
    setIsOpen(false)
    // Save cookie to prevent showing the popup for the next 5 days
    document.cookie = "newsletter_slidein_dismissed=true; path=/; max-age=432000; SameSite=Lax";
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent click-outside area on mobile to dismiss */}
          {isMobile && (
            <div 
              className="fixed inset-0 z-40 bg-black/20" 
              onClick={handleClose} 
            />
          )}

          <motion.div
            initial={isMobile ? { y: '100%', opacity: 1 } : { y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: '100%', opacity: 1 } : { y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`fixed z-50 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden
              ${
                isMobile 
                  ? 'bottom-0 left-0 right-0 w-full rounded-t-3xl p-6 pb-10' 
                  : 'bottom-6 right-6 w-full max-w-sm rounded-2xl p-6'
              }
            `}
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            {/* Ambient glow decoration */}
            <div
              className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ background: 'var(--blog-accent)' }}
            />

            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Cerrar"
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight">
                Contenido audiovisual con IA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-light leading-relaxed">
                Suscríbete a nuestra newsletter para recibir las mejores estrategias y novedades de conversión.
              </p>
              <SubscribeForm />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
