"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  userMetadata: { username: string; hasCompletedOnboarding?: boolean } | null
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userMetadata, setUserMetadata] = useState<{ username: string; hasCompletedOnboarding?: boolean } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkOnboardingStatus = async (userId: string) => {
    try {
      // Check if user preferences exist
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error("Error checking onboarding status:", error)
        return false
      }

      return !!preferences // Return true if preferences exist
    } catch (error) {
      console.error("Error in checkOnboardingStatus:", error)
      return false
    }
  }

  const getUserMetadata = async (userId: string) => {
    try {
      // First check if the user exists in auth.users
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser.user) {
        console.error("Error getting auth user:", authError)
        return null
      }

      // Then get the user profile
      const { data: metadata, error } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error) {
        console.error("Error getting user metadata:", error)
        return null
      }
    
      if (metadata) {
        const hasCompletedOnboarding = await checkOnboardingStatus(userId)
        setUserMetadata({
          username: metadata.username,
          hasCompletedOnboarding
        })
        return hasCompletedOnboarding
      }

      return null
    } catch (error) {
      console.error("Error in getUserMetadata:", error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    async function initializeAuth() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error("Session error:", sessionError)
          setIsLoading(false)
          return
        }

        if (session?.user && mounted) {
          setUser(session.user)
          const hasCompletedOnboarding = await getUserMetadata(session.user.id)
          
          // If user is logged in but hasn't completed onboarding, redirect them
          if (hasCompletedOnboarding === false && window.location.pathname !== '/onboarding') {
            router.push('/onboarding')
          }
        } else {
          setUser(null)
          setUserMetadata(null)
        }
        
        if (mounted) {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      if (session?.user) {
        setUser(session.user)
        const hasCompletedOnboarding = await getUserMetadata(session.user.id)
        
        // If user is logged in but hasn't completed onboarding, redirect them
        if (hasCompletedOnboarding === false && window.location.pathname !== '/onboarding') {
          router.push('/onboarding')
        }
      } else {
        setUser(null)
        setUserMetadata(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const login = async (emailOrUsername: string, password: string) => {
    setIsLoading(true)
    try {
      let loginEmail = emailOrUsername
      
      // First try to find user by username if it doesn't look like an email
      if (!emailOrUsername.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle()
        
        if (userError) {
          console.error("Error looking up username:", userError)
          throw new Error('Username lookup failed')
        }
        
        if (!userData) {
          throw new Error('Username not found')
        }
        
        loginEmail = userData.email
      }

      // Attempt to sign in with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid password')
        }
        throw error
      }

      // Wait for session to be set
      if (data.user) {
        setUser(data.user)
        const hasCompletedOnboarding = await getUserMetadata(data.user.id)
        
        // Redirect based on onboarding status
        if (!hasCompletedOnboarding) {
          router.push('/onboarding')
        } else {
          router.push('/page/library')
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle()

      if (existingUser) {
        throw new Error('Username already taken')
      }

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })
      
      if (error) throw error

      if (data.user) {
        // Create user profile with username
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: data.user.id,
              username,
              email
            }
          ])
        
        if (profileError) {
          console.error("Profile creation error:", profileError)
          throw new Error('Failed to create user profile')
        }

        // Create empty preferences to mark onboarding as incomplete
        const { error: preferencesError } = await supabase
          .from('user_preferences')
          .insert([
            {
              user_id: data.user.id,
              target_language: null,
              preferred_genres: [],
              gender: null
            }
          ])

        if (preferencesError) {
          console.error("Error creating preferences:", preferencesError)
        }
      }

      // Sign out after successful registration
      await supabase.auth.signOut()
      router.push('/page/login?message=Please check your email to verify your account')
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUserMetadata(null)
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userMetadata,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

