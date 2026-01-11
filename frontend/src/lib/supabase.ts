import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Using hardcoded values for production build (env vars not working in Docker build)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://api.wally.leomat.it'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'wally-auth',
  },
  db: {
    schema: 'wally', // Use wally schema for all database queries
  },
  global: {
    headers: {
      'X-Client-Info': 'wally-web-app',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
})

// ============================================================================
// TypeScript Database Types
// ============================================================================

export type Database = {
  wally: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['tenants']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          preferences: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['profiles']['Insert']>
      }
      vehicles: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          targa: string
          marca: string
          modello: string
          immatricolazione: string
          potenza_kw: number
          classe_ambientale: string
          regione: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['vehicles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['vehicles']['Insert']>
      }
      vehicle_deadlines: {
        Row: {
          id: string
          vehicle_id: string
          deadline_type: 'bollo' | 'revisione' | 'assicurazione'
          due_date: string
          amount: number | null
          status: 'paid' | 'pending' | 'overdue' | 'ok' | 'upcoming' | 'active' | 'expiring' | 'expired'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['vehicle_deadlines']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['vehicle_deadlines']['Insert']>
      }
      vat_profiles: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          partita_iva: string
          codice_ateco: string
          regime_fiscale: string
          coefficiente_redditivita: number
          aliquota_imposta: number
          gestione_inps: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['vat_profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['vat_profiles']['Insert']>
      }
      tax_deadlines: {
        Row: {
          id: string
          vat_profile_id: string
          title: string
          description: string | null
          due_date: string
          amount: number
          status: 'upcoming' | 'paid' | 'overdue'
          deadline_type: 'imposta' | 'inps' | 'acconto' | 'saldo'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['tax_deadlines']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['tax_deadlines']['Insert']>
      }
      home_expenses: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          category: 'luce' | 'gas' | 'acqua' | 'internet' | 'condominio' | 'altro'
          provider: string
          amount: number
          due_date: string
          frequency: 'mensile' | 'bimestrale' | 'trimestrale' | 'semestrale' | 'annuale'
          status: 'paid' | 'pending' | 'overdue'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['home_expenses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['home_expenses']['Insert']>
      }
      calendar_events: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          title: string
          description: string | null
          event_date: string
          module: 'auto' | 'piva' | 'casa' | 'general'
          event_type: string
          amount: number | null
          reference_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['wally']['Tables']['calendar_events']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['wally']['Tables']['calendar_events']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: 'deadline' | 'reminder' | 'alert' | 'info'
          read: boolean
          related_module: 'auto' | 'piva' | 'casa' | 'general' | null
          related_id: string | null
          created_at: string
        }
        Insert: Omit<Database['wally']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['wally']['Tables']['notifications']['Insert']>
      }
    }
  }
}
