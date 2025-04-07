"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  userMetadata: { username: string; hasCompletedOnboarding?: boolean; avatarUrl?: string } | null
  isLoading: boolean
  login: (emailOrUsername: string, password: string) => Promise<void>
  signup: (username: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userMetadata, setUserMetadata] = useState<{ username: string; hasCompletedOnboarding?: boolean; avatarUrl?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isAuthenticated = !!user

  // Explicitly define isAuthenticated
  const getLastAuthAction = () => {
    try {
      const timestamp = localStorage.getItem('last_auth_action_timestamp');
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (e) {
      return 0;
    }
  };

  const setLastAuthAction = () => {
    try {
      localStorage.setItem('last_auth_action_timestamp', Date.now().toString());
    } catch (e) {
      console.error("Error setting last auth action timestamp:", e);
    }
  };

  // Add a flow tracking helper
  const getFlowState = () => {
    try {
      return sessionStorage.getItem('auth_flow') || null;
    } catch (e) {
      return null;
    }
  };

  const setFlowState = (state: string) => {
    try {
      sessionStorage.setItem('auth_flow', state);
      console.log("Auth flow state set to:", state);
      // Always update the timestamp when changing flow state
      setLastAuthAction();
    } catch (e) {
      console.error("Error setting flow state:", e);
    }
  };

  const clearFlowState = () => {
    try {
      sessionStorage.removeItem('auth_flow');
      console.log("Auth flow state cleared");
    } catch (e) {
      console.error("Error clearing flow state:", e);
    }
  };

  // Clean slate function to clear all auth-related local storage
  const resetAllAuthState = () => {
    try {
      // Clear all auth-related state
      sessionStorage.removeItem('auth_flow');
      localStorage.removeItem('redirectHistory');
      localStorage.removeItem('lastRedirect');
      localStorage.removeItem('noRedirect');
      localStorage.removeItem('last_auth_action_timestamp');
    } catch (e) {
      console.error("Error clearing auth state:", e);
    }
  };

  const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
    try {
      // Check the user_profiles table for the onboarding flag
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('has_completed_onboarding') 
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error("Error checking onboarding status:", error)
        return false // Assume not completed if error occurs
      }

      // Return true if the record exists and the flag is explicitly true
      return !!profile?.has_completed_onboarding
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
        .select('username, avatar_url, has_completed_onboarding')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (error) {
        console.error("Error getting user metadata:", error)
        return null
      }
    
      if (metadata) {
        const hasCompletedOnboarding = metadata.has_completed_onboarding || false
        
        // If we're checking metadata and onboarding is false, set flow state
        if (!hasCompletedOnboarding && !getFlowState()) {
          setFlowState('needs_onboarding');
        } else if (hasCompletedOnboarding && getFlowState() === 'needs_onboarding') {
          // Clear flow state if onboarding is now complete
          clearFlowState();
        }
        
        setUserMetadata({
          username: metadata.username,
          hasCompletedOnboarding,
          avatarUrl: metadata.avatar_url
        })
        return hasCompletedOnboarding
      }

      return null
    } catch (error) {
      console.error("Error in getUserMetadata:", error)
      return null
    }
  }

  const preventRedirect = () => {
    // Check if there's a localStorage flag to prevent redirect
    const noRedirect = localStorage.getItem('noRedirect');
    if (noRedirect) {
      // Clear the flag after checking
      localStorage.removeItem('noRedirect');
      return true;
    }
    
    // Also check URL for a parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('noRedirect') === 'true') {
      return true;
    }
    
    return false;
  };

  // Special function to detect and break infinite redirect loops
  const detectRedirectLoop = () => {
    try {
      // Check if the user manually marked onboarding as complete
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
      if (hasCompletedOnboarding && window.location.pathname === '/onboarding') {
        console.log("User marked as completed onboarding but on onboarding page - redirecting to library");
        router.push('/page/library');
        return true;
      }
      
      type RedirectHistoryItem = {
        path: string;
        timestamp: number;
      };
      
      const redirectHistory = JSON.parse(localStorage.getItem('redirectHistory') || '[]') as RedirectHistoryItem[];
      const currentPath = window.location.pathname;
      
      // Add current path to history
      redirectHistory.push({
        path: currentPath,
        timestamp: new Date().getTime()
      });
      
      // Only keep last 10 redirects
      if (redirectHistory.length > 10) {
        redirectHistory.splice(0, redirectHistory.length - 10);
      }
      
      // Save updated history
      localStorage.setItem('redirectHistory', JSON.stringify(redirectHistory));
      
      // Log navigation history for debugging
      console.log("Navigation history:", redirectHistory.slice(-5).map(r => r.path).join(' -> '));
      
      // Check for loop pattern (e.g., login -> onboarding -> login)
      if (redirectHistory.length >= 3) {
        // Look for repeated patterns like A->B->A->B
        const last4Paths = redirectHistory.slice(-4).map(r => r.path);
        const isSimpleLoop = 
          (last4Paths.length >= 4 && 
           last4Paths[0] === last4Paths[2] && 
           last4Paths[1] === last4Paths[3]);
           
        // Look for onboarding<->login loop specifically  
        const last3Paths = redirectHistory.slice(-3).map(r => r.path);
        const isOnboardingLoginLoop = 
          (last3Paths[0] === '/page/login' && last3Paths[1] === '/onboarding' && last3Paths[2] === '/page/login') ||
          (last3Paths[0] === '/onboarding' && last3Paths[1] === '/page/login' && last3Paths[2] === '/onboarding');
        
        // If loop detected, take action but DON'T reset auth
        if (isSimpleLoop || isOnboardingLoginLoop) {
          console.warn(`Redirect loop detected! ${isSimpleLoop ? 'Simple loop' : 'Onboarding-login loop'}`);
          
          // Set a flag to break the loop
          localStorage.setItem('noRedirect', 'true');
          localStorage.setItem('loopDetectedAt', Date.now().toString());
          
          // Check for onboarding completion status from local storage as a backup
          const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
          
          // Break the loop based on current context
          if (window.location.pathname === '/onboarding') {
            if (hasCompletedOnboarding) {
              // If already completed onboarding, go to library
              console.log("Breaking loop: Onboarding already completed, redirecting to library");
              router.push('/page/library');
              return true;
            } else if (user) {
              // If we have a user but are stuck in a loop, manually mark as complete
              console.log("Breaking loop: User authenticated but stuck in loop, forcing onboarding completion");
              localStorage.setItem('hasCompletedOnboarding', 'true');
              
              // Try to update database in background
              if (user.id) {
                supabase
                  .from('user_profiles')
                  .update({ has_completed_onboarding: true })
                  .eq('user_id', user.id)
                  .then(() => {
                    console.log("Forced onboarding completion saved to database");
                  })
                  .catch((err: Error) => {
                    console.error("Error forcing onboarding completion:", err);
                  });
              }
              
              router.push('/page/library');
              return true;
            }
          } else if (window.location.pathname === '/page/login' && user) {
            // If on login page but already logged in, redirect to library
            console.log("Breaking loop: Already logged in, redirecting to library");
            router.push('/page/library');
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error in detectRedirectLoop:', error);
      return false;
    }
  };

  // Initialize auth for both client and route handlers
  const initializeAuth = async () => {
    if (typeof window === 'undefined') return; // Skip on server-side
            
    try {
      // Attempt to get the current session user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        // Don't throw here, try getUser next as session might be invalid
      }

      if (session?.user) {
        // Verify the user exists in Supabase Auth
        const { data: { user: verifiedUser }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Error verifying user with Supabase Auth:", userError);
          // THIS IS THE CRITICAL PART: If getUser fails, the token/session is invalid.
          // Sign out client-side and clear state.
          await supabase.auth.signOut();
          setUser(null);
          setUserMetadata(null);
          resetAllAuthState(); // Clear any potentially problematic state
          setFlowState('auth_error_handled'); // Indicate error was handled
        } else if (verifiedUser) {
          setUser(verifiedUser);
          // Fetch metadata only after successful user verification
          await getUserMetadata(verifiedUser.id);
        } else {
          // Should not happen if session.user exists, but handle defensively
          await supabase.auth.signOut();
          setUser(null);
          setUserMetadata(null);
          resetAllAuthState();
        }
      } else {
        setUser(null);
        setUserMetadata(null);
        // If on a protected route without a session, clear flow state
        if (window.location.pathname !== '/page/login' && window.location.pathname !== '/page/register') {
          clearFlowState();
        }

      }
    } catch (error) {
      console.error("Unexpected error during auth initialization:", error);
      // Generic error handling: sign out and clear state
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error("Error during sign out after unexpected error:", signOutError);
      }
      setUser(null);
      setUserMetadata(null);
      resetAllAuthState();
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
      // Detect loop after initialization finishes
      if (detectRedirectLoop()) {
         // Intentionally left blank to reduce console noise
      }
    }
  }

  // Handler for profile updates triggered by settings page
  const handleProfileUpdate = async (event: Event) => {
    console.log("AuthContext received profile update event");
    const customEvent = event as CustomEvent;
    const { username: updatedUsername, avatarUrl: updatedAvatarUrl } = customEvent.detail;

    if (user) {
      console.log("Updating user metadata state with:", { updatedUsername, updatedAvatarUrl });
      // Re-fetch all metadata to ensure consistency, or update selectively
      // Option 1: Re-fetch (simpler, ensures all data is fresh)
       await getUserMetadata(user.id);

      // Option 2: Update selectively (might be faster if getUserMetadata is heavy)
      // setUserMetadata(prev => {
      //   if (!prev) return null;
      //   return {
      //     ...prev,
      //     username: updatedUsername ?? prev.username,
      //     avatarUrl: updatedAvatarUrl ?? prev.avatarUrl
      //   };
      // });
    } else {
      console.warn("Profile update event received but no user is logged in.");
    }
  };

  // Listener for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setLastAuthAction(); // Record timestamp

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setUserMetadata(null);
          clearFlowState();
          setIsLoading(false); // Ensure loading stops on explicit sign out
          // Only redirect if not already on a public page
          if (window.location.pathname !== '/page/login' && window.location.pathname !== '/page/register') {
             router.push("/page/login");
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (!session.user) {
             console.error(`Auth event ${event} received but session has no user.`);
             await supabase.auth.signOut(); // Sign out if state is inconsistent
          return;
        }
          console.log(`Handling ${event}. User:`, session.user.email);
          setUser(session.user);
          const onboardingComplete = await getUserMetadata(session.user.id);
          setIsLoading(false); // Stop loading after successful sign-in/refresh

          // Determine redirect based on onboarding status
           if (onboardingComplete === false) { // Explicitly check for false
             console.log("Redirecting to onboarding.");
             setFlowState('needs_onboarding');
             router.push("/onboarding");
           } else if (onboardingComplete === true && (window.location.pathname === '/page/login' || window.location.pathname === '/page/register' || window.location.pathname === '/onboarding')) {
             // Only redirect from login/register/onboarding if onboarding is complete
             console.log("Onboarding complete, redirecting to library from login/register/onboarding.");
             clearFlowState();
             router.push("/page/library");
           } else {
             // Otherwise, stay on current page or let AppLayout handle redirects
             console.log("User signed in/refreshed, staying on current page or letting AppLayout handle redirect.");
             if (onboardingComplete === true) clearFlowState(); // Ensure flow state is clear if onboarding is done
           }
        } else if (event === 'INITIAL_SESSION') {
           if (session?.user) {
              // Can potentially trigger initializeAuth again or just update user state
              // For now, rely on initializeAuth having run
           } else {
              // If INITIAL_SESSION has no user, ensure state is cleared
              setUser(null);
              setUserMetadata(null);
              setIsLoading(false);
           }
        }
      }
    );

    // Initial check when the component mounts
    initializeAuth();

    // Add listener for profile updates from settings page
    window.addEventListener('auth:profileUpdated', handleProfileUpdate);

    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('auth:profileUpdated', handleProfileUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Keep router dependency

  // Special function to check onboarding status directly from DB, bypassing any cache
  const checkOnboardingStatusFresh = async (userId: string): Promise<boolean> => {
    try {
      console.log("Performing fresh check of onboarding status for user:", userId);
      
      // Check the user_profiles table directly with cache control
      const { data, error } = await supabase
        .from('user_profiles')
        .select('has_completed_onboarding, username') 
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Fresh onboarding check error:", error);
        return false;
      }
      
      const status = !!data?.has_completed_onboarding;
      console.log("Fresh onboarding status result:", status, "for user:", data?.username);
      
      // Update the metadata state with this fresh value
      setUserMetadata(prev => prev ? {
        ...prev, 
        username: data?.username || prev.username,
        hasCompletedOnboarding: status,
        avatarUrl: prev.avatarUrl // Keep existing avatarUrl unless fetched here too
      } : null); // Return null if prev is null
      
      return status;
    } catch (error) {
      console.error("Error in fresh onboarding check:", error);
      return false;
    }
  };

  const login = async (emailOrUsername: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Check for rapid login attempts that might indicate a loop
      const lastActionTime = getLastAuthAction();
      const now = Date.now();
      if (now - lastActionTime < 2000) { // Less than 2 seconds between auth actions
        console.warn("Rapid auth actions detected, possible loop. Adding delay.");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setLastAuthAction();

      let loginEmail = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .maybeSingle();
        if (userError) {
          console.error("Error looking up username:", userError);
          throw new Error('Error finding user');
        }
        if (!userData || !userData.email) {
          throw new Error('Username not found');
        }
        loginEmail = userData.email;
      }

      localStorage.setItem('last_login_attempt', Date.now().toString());

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid login credentials');
        }
        // Handle email not confirmed error
        if (error.message.includes('Email not confirmed')) {
           throw new Error('Please confirm your email before logging in.');
        }
        throw error;
      }

      if (data.user) {
        setUser(data.user);
        resetAllAuthState();

        const onboardingStatus = await checkOnboardingStatusFresh(data.user.id);
        console.log("Fresh onboarding status check:", onboardingStatus);

        setFlowState(onboardingStatus ? 'completed_onboarding' : 'needs_onboarding');

        if (detectRedirectLoop()) {
          console.log("Redirect loop broken during login");
          clearFlowState();
          router.push('/page/library');
          return; // Exit early after redirect
        }

        if (!preventRedirect()) {
          if (onboardingStatus === false) {
            if (window.location.pathname !== '/onboarding') {
              console.log("Redirecting to onboarding after login");
              router.push('/onboarding');
            }
          } else if (window.location.pathname === '/page/login' || window.location.pathname === '/page/register' || window.location.pathname === '/onboarding') {
             // Redirect to library if login was successful and onboarding is done
             console.log("Login successful, onboarding complete, redirecting to library.");
             router.push('/page/library');
           } else {
             // Otherwise stay put
             console.log("Login successful, onboarding complete, staying on current page.");
           }
        }
      } else {
         // Handle case where login succeeds but no user data is returned (shouldn't happen)
         throw new Error("Login successful but no user data received.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      clearFlowState(); // Clear flow state on error
      throw error; // Re-throw error to be caught by the component
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Check if username is already taken
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();
      if (existingUser) {
        throw new Error('Username already taken');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            email: email
          },
          emailRedirectTo: `${window.location.origin}/page/login?verified=true`
        }
      });
      
      if (error) throw error;

      if (data.user) {
        // Create profile immediately after successful auth signup
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              username: username,
              email: email,
              has_completed_onboarding: false
          });
            
          if (profileError) {
          console.error("Error creating profile during signup:", profileError);
          // Decide how to handle this - maybe delete the auth user?
          // For now, just log it.
        }
        console.log("User registration initiated. User needs to verify email.");
      } else {
         // Handle case where signup succeeds but no user data is returned
         throw new Error("Signup successful but no user data received.");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error; // Re-throw error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    resetAllAuthState(); // Clear local/session state first
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
        // Still attempt to clear client state even if server logout fails
      }
    } catch(e) {
       console.error("Exception during logout:", e);
    } finally {
       // Always clear client state and redirect
       setUser(null);
       setUserMetadata(null);
       setIsLoading(false);
       clearFlowState();
       // Use replace to avoid login page being in history after logout
       router.replace("/page/login?logout=true");
    }
  };

  // Provide the context value
  const value = {
        user,
        userMetadata,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


