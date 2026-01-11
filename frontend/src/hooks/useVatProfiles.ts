import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type VatProfile = Database['wally']['Tables']['vat_profiles']['Row']
type VatProfileInsert = Database['wally']['Tables']['vat_profiles']['Insert']
type VatProfileUpdate = Database['wally']['Tables']['vat_profiles']['Update']

// ============================================================================
// READ - Get VAT profile for current user
// ============================================================================

export const useVatProfile = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['vat_profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vat_profiles')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching VAT profile:', error)
        throw new Error(error.message)
      }

      return data as VatProfile | null
    },
    enabled: !!user,
  })
}

// ============================================================================
// CREATE - Create VAT profile
// ============================================================================

export const useCreateVatProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profile: VatProfileInsert) => {
      const { data, error } = await supabase
        .from('vat_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) {
        console.error('Error creating VAT profile:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vat_profile'] })
      toast.success('Profilo P.IVA creato con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante la creazione del profilo P.IVA: ' + error.message)
    },
  })
}

// ============================================================================
// UPDATE - Update VAT profile
// ============================================================================

export const useUpdateVatProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VatProfileUpdate }) => {
      const { data, error } = await supabase
        .from('vat_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating VAT profile:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vat_profile'] })
      toast.success('Profilo P.IVA aggiornato con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiornamento del profilo P.IVA: ' + error.message)
    },
  })
}
