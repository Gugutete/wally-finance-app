import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type TaxDeadline = Database['wally']['Tables']['tax_deadlines']['Row']
type TaxDeadlineInsert = Database['wally']['Tables']['tax_deadlines']['Insert']
type TaxDeadlineUpdate = Database['wally']['Tables']['tax_deadlines']['Update']

// ============================================================================
// READ - Get all tax deadlines
// ============================================================================

export const useTaxDeadlines = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tax_deadlines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_deadlines')
        .select(`
          *,
          vat_profiles(*)
        `)
        .order('due_date', { ascending: true })

      if (error) {
        console.error('Error fetching tax deadlines:', error)
        throw new Error(error.message)
      }

      return data
    },
    enabled: !!user,
  })
}

// ============================================================================
// CREATE - Add new tax deadline
// ============================================================================

export const useCreateTaxDeadline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deadline: TaxDeadlineInsert) => {
      const { data, error } = await supabase
        .from('tax_deadlines')
        .insert(deadline)
        .select()
        .single()

      if (error) {
        console.error('Error creating tax deadline:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_deadlines'] })
      toast.success('Scadenza fiscale aggiunta con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiunta della scadenza: ' + error.message)
    },
  })
}

// ============================================================================
// UPDATE - Update tax deadline
// ============================================================================

export const useUpdateTaxDeadline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TaxDeadlineUpdate }) => {
      const { data, error } = await supabase
        .from('tax_deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating tax deadline:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_deadlines'] })
      toast.success('Scadenza fiscale aggiornata con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiornamento della scadenza: ' + error.message)
    },
  })
}

// ============================================================================
// DELETE - Delete tax deadline
// ============================================================================

export const useDeleteTaxDeadline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tax_deadlines')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting tax deadline:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax_deadlines'] })
      toast.success('Scadenza fiscale eliminata con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'eliminazione della scadenza: ' + error.message)
    },
  })
}
