import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type CalendarEvent = Database['wally']['Tables']['calendar_events']['Row']
type CalendarEventInsert = Database['wally']['Tables']['calendar_events']['Insert']
type CalendarEventUpdate = Database['wally']['Tables']['calendar_events']['Update']

// ============================================================================
// READ - Get all calendar events
// ============================================================================

export const useCalendarEvents = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['calendar_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) {
        console.error('Error fetching calendar events:', error)
        throw new Error(error.message)
      }

      return data as CalendarEvent[]
    },
    enabled: !!user,
  })
}

// ============================================================================
// READ - Get events by module
// ============================================================================

export const useCalendarEventsByModule = (module: 'auto' | 'piva' | 'casa' | 'general') => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['calendar_events', module],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('module', module)
        .order('event_date', { ascending: true })

      if (error) {
        console.error('Error fetching calendar events:', error)
        throw new Error(error.message)
      }

      return data as CalendarEvent[]
    },
    enabled: !!user,
  })
}

// ============================================================================
// CREATE - Add new calendar event
// ============================================================================

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: CalendarEventInsert) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single()

      if (error) {
        console.error('Error creating calendar event:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
      toast.success('Evento aggiunto al calendario!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiunta dell\'evento: ' + error.message)
    },
  })
}

// ============================================================================
// UPDATE - Update calendar event
// ============================================================================

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: CalendarEventUpdate }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating calendar event:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
      toast.success('Evento aggiornato!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiornamento dell\'evento: ' + error.message)
    },
  })
}

// ============================================================================
// DELETE - Delete calendar event
// ============================================================================

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting calendar event:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] })
      toast.success('Evento eliminato!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'eliminazione dell\'evento: ' + error.message)
    },
  })
}
