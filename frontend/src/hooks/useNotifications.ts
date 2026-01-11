import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, Database } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type Notification = Database['wally']['Tables']['notifications']['Row']

// ============================================================================
// READ - Get all notifications
// ============================================================================

export const useNotifications = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications:', error)
        throw new Error(error.message)
      }

      return data as Notification[]
    },
    enabled: !!user,
  })
}

// ============================================================================
// READ - Get unread notifications count
// ============================================================================

export const useUnreadNotificationsCount = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)

      if (error) {
        console.error('Error fetching unread count:', error)
        throw new Error(error.message)
      }

      return count || 0
    },
    enabled: !!user,
  })
}

// ============================================================================
// UPDATE - Mark notification as read
// ============================================================================

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) {
        console.error('Error marking notification as read:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

// ============================================================================
// UPDATE - Mark all notifications as read
// ============================================================================

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false)

      if (error) {
        console.error('Error marking all notifications as read:', error)
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Tutte le notifiche segnate come lette')
    },
  })
}
