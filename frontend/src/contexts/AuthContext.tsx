import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
        }

        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle different auth events
      if (event === 'SIGNED_IN') {
        toast.success('Login effettuato con successo!')
      } else if (event === 'SIGNED_OUT') {
        toast.info('Logout effettuato')
      } else if (event === 'USER_UPDATED') {
        toast.success('Profilo aggiornato')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)

      // Using fetch directly (same as signup) to avoid client issues
      const supabaseUrl = 'https://api.wally.leomat.it'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

      const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!loginResponse.ok) {
        const error = await loginResponse.json()
        const errorMsg = error.msg || error.message || error.error_description || 'Login failed'
        throw new Error(errorMsg)
      }

      const loginData = await loginResponse.json()

      // Set session in Supabase client for other features
      await supabase.auth.setSession({
        access_token: loginData.access_token,
        refresh_token: loginData.refresh_token,
      })

      // CRITICAL: Update state immediately before navigate
      setSession(loginData)
      setUser(loginData.user)

      toast.success('Login effettuato con successo!')
      navigate('/')
    } catch (error) {
      const authError = error as AuthError | Error
      console.error('Sign in error:', authError)
      toast.error(authError.message || 'Errore durante il login')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)

      // Step 1: Create auth user (using fetch directly to avoid Supabase client issues)
      const supabaseUrl = 'https://api.wally.leomat.it'
      const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

      const signupResponse = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        }),
      })

      if (!signupResponse.ok) {
        const error = await signupResponse.json()
        // Show the actual error message from API
        const errorMsg = error.msg || error.message || error.error_description || 'Signup failed'
        throw new Error(errorMsg)
      }

      const authData = await signupResponse.json()

      if (!authData.user) {
        throw new Error('User creation failed')
      }

      const userId = authData.user.id

      // Get access token for authenticated requests
      const loginForTokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const tokenData = await loginForTokenResponse.json()
      const accessToken = tokenData.access_token

      // Step 2: Create tenant using fetch
      const tenantResponse = await fetch(`${supabaseUrl}/rest/v1/tenants`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept-Profile': 'wally',
          'Content-Profile': 'wally',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          name: `${fullName}'s Workspace`,
          slug: email.split('@')[0].toLowerCase() + '-' + Date.now(),
        }),
      })

      if (!tenantResponse.ok) {
        const error = await tenantResponse.json()
        throw new Error('Errore nella creazione del workspace: ' + (error.message || 'Unknown error'))
      }

      const tenantData = await tenantResponse.json()
      const tenant = Array.isArray(tenantData) ? tenantData[0] : tenantData

      // Step 3: Create profile using fetch
      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept-Profile': 'wally',
          'Content-Profile': 'wally',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          id: userId,
          tenant_id: tenant.id,
          email: authData.user.email!,
          full_name: fullName,
          role: 'owner',
          preferences: {},
        }),
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        throw new Error('Errore nella creazione del profilo: ' + (error.message || 'Unknown error'))
      }

      // Step 4: Auto-login after signup
      const loginResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()

        // Set session in Supabase client
        await supabase.auth.setSession({
          access_token: loginData.access_token,
          refresh_token: loginData.refresh_token,
        })
      }

      toast.success('Registrazione completata con successo!')

      // Navigate to dashboard
      navigate('/')
    } catch (error) {
      const authError = error as AuthError | Error
      console.error('Sign up error:', authError)
      toast.error(authError.message || 'Errore durante la registrazione')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      navigate('/login')
    } catch (error) {
      const authError = error as AuthError
      console.error('Sign out error:', authError)
      toast.error(authError.message || 'Errore durante il logout')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
