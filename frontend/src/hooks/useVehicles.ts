import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type Vehicle = Database['wally']['Tables']['vehicles']['Row']
type VehicleInsert = Database['wally']['Tables']['vehicles']['Insert']
type VehicleUpdate = Database['wally']['Tables']['vehicles']['Update']
type VehicleDeadline = Database['wally']['Tables']['vehicle_deadlines']['Row']

export interface VehicleWithDeadlines extends Vehicle {
  vehicle_deadlines: VehicleDeadline[]
}

// ============================================================================
// READ - Get all vehicles for current user
// ============================================================================

export const useVehicles = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_deadlines(*)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vehicles:', error)
        throw new Error(error.message)
      }

      return data as VehicleWithDeadlines[]
    },
    enabled: !!user,
  })
}

// ============================================================================
// READ - Get single vehicle by ID
// ============================================================================

export const useVehicle = (id: string | undefined) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      if (!id) throw new Error('Vehicle ID is required')

      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          vehicle_deadlines(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching vehicle:', error)
        throw new Error(error.message)
      }

      return data as VehicleWithDeadlines
    },
    enabled: !!user && !!id,
  })
}

// ============================================================================
// CREATE - Add new vehicle
// ============================================================================

export const useCreateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vehicle: VehicleInsert) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single()

      if (error) {
        console.error('Error creating vehicle:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Veicolo aggiunto con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiunta del veicolo: ' + error.message)
    },
  })
}

// ============================================================================
// UPDATE - Update vehicle
// ============================================================================

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VehicleUpdate }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating vehicle:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Veicolo aggiornato con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiornamento del veicolo: ' + error.message)
    },
  })
}

// ============================================================================
// DELETE - Delete vehicle
// ============================================================================

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting vehicle:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Veicolo eliminato con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'eliminazione del veicolo: ' + error.message)
    },
  })
}

// ============================================================================
// Vehicle Deadlines Management
// ============================================================================

type VehicleDeadlineInsert = Database['wally']['Tables']['vehicle_deadlines']['Insert']
type VehicleDeadlineUpdate = Database['wally']['Tables']['vehicle_deadlines']['Update']

export const useCreateVehicleDeadline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deadline: VehicleDeadlineInsert) => {
      const { data, error } = await supabase
        .from('vehicle_deadlines')
        .insert(deadline)
        .select()
        .single()

      if (error) {
        console.error('Error creating deadline:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Scadenza aggiunta con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiunta della scadenza: ' + error.message)
    },
  })
}

export const useUpdateVehicleDeadline = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VehicleDeadlineUpdate }) => {
      const { data, error } = await supabase
        .from('vehicle_deadlines')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating deadline:', error)
        throw new Error(error.message)
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Scadenza aggiornata con successo!')
    },
    onError: (error: Error) => {
      toast.error('Errore durante l\'aggiornamento della scadenza: ' + error.message)
    },
  })
}
