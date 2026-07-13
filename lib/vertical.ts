import { cache } from 'react'
import { supabase } from '@/lib/supabase'

// `verticales_panel` solo permite lectura a `service_role` (contiene tokens
// sensibles: ownership_token, newsletter_token, notif_email...). Este cliente
// usa la clave anon, así que una consulta directa a esa tabla siempre
// devuelve null por RLS, sin error visible. `verticales_panel_public` es una
// vista sin las columnas sensibles, con SELECT público — ver LL-004.
export const getVerticalConfig = cache(async () => {
  const verticalId = process.env.VERTICAL_ID
  if (!verticalId) return null

  const { data, error } = await supabase
    .from('verticales_panel_public')
    .select('*')
    .eq('vertical_id', verticalId)
    .single()

  if (error) {
    console.error('[getVerticalConfig] Error al consultar verticales_panel_public:', error.message)
  }

  return data ?? null
})
