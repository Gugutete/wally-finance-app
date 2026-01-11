import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type HomeExpense = Database['wally']['Tables']['home_expenses']['Row']
type HomeExpenseInsert = Database['wally']['Tables']['home_expenses']['Insert']
type HomeExpenseUpdate = Database['wally']['Tables']['home_expenses']['Update']

// ============================================================================
// READ - Get all home expenses
// ============================================================================

export const useHomeExpenses = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['home_expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_expenses')
        .select('*')
        .order('due_date', { ascending: true })

      if (error) {
        console.error('Error fetching home expenses:', error)
        throw new Error(error.message)
      }

      return data as HomeExpense[]
    },
    enabled: !!user,
  })
}

// ============================================================================
// CREATE - Add new home expense
// ============================================================================

export const useCreateHomeExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (expense: HomeExpenseInsert) => {
      const { data, error } = await supabase
        .from('home_expenses')
        .insert(expense)
        .select()
        .single()

      if (error) {
        console.error('Error creating home expense:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_expenses'] })
      toast.success('Spesa aggiunta con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiunta della spesa: ' + error.message)
    },
  })
}

// ============================================================================
// UPDATE - Update home expense
// ============================================================================

export const useUpdateHomeExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: HomeExpenseUpdate }) => {
      const { data, error } = await supabase
        .from('home_expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating home expense:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_expenses'] })
      toast.success('Spesa aggiornata con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiornamento della spesa: ' + error.message)
    },
  })
}

// ============================================================================
// DELETE - Delete home expense
// ============================================================================

export const useDeleteHomeExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('home_expenses')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting home expense:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_expenses'] })
      toast.success('Spesa eliminata con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'eliminazione della spesa: ' + error.message)
    },
  })
}
