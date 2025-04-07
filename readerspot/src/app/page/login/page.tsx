"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import Link from "@/app/components/NextLink"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, HelpCircle } from "lucide-react"
import Image from "@/app/components/NextImage"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Checkbox } from "@/app/(components)/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/(components)/ui/tooltip"
import logo from "@/app/assets/Logo.png"
import { useAuth } from "@/app/contexts/AuthContext"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Check for query parameters
    const msgParam = searchParams.get('message')
    if (msgParam) {
      setSuccessMessage(msgParam)
    }
    
    // Verified parameter
    const verified = searchParams.get('verified')
    if (verified === 'true') {
      setSuccessMessage('Email verified successfully! You can now log in.')
    }
    
    // Check and clear any existing auth flow
    try {
      const currentFlow = sessionStorage.getItem('auth_flow');
      console.log("Login page loaded with flow state:", currentFlow);
      
      // If we have a redirect loop and we're on login page, clear the flow
      if (currentFlow && currentFlow !== 'initial') {
        console.log("Clearing existing flow state on login page load");
        sessionStorage.removeItem('auth_flow');
      }
      
      // Clear loop prevention flags if they've been set for more than 5 minutes
      const onboardingCompletedTime = parseInt(localStorage.getItem('onboarding_completed_time') || '0', 10);
      const now = Date.now();
      if (onboardingCompletedTime && (now - onboardingCompletedTime > 5 * 60 * 1000)) {
        console.log("Clearing stale onboarding completion flags");
        localStorage.removeItem('onboarding_completed');
        localStorage.removeItem('onboarding_completed_time');
      }
      
      // Set login page load timestamp
      localStorage.setItem('login_page_loaded', now.toString());
      
      // Check for rapid page cycles (potential loop indication)
      const lastLoad = parseInt(localStorage.getItem('login_last_loaded') || '0', 10);
      if (now - lastLoad < 3000) { // Less than 3 seconds between loads
        console.warn("Rapid login page loads detected, possible loop");
        
        // Force a break in the potential loop by clearing all auth state
        sessionStorage.removeItem('auth_flow');
        localStorage.removeItem('lastRedirect');
        localStorage.removeItem('redirectHistory');
        localStorage.removeItem('noRedirect');
        localStorage.removeItem('login_page_loaded');
        localStorage.removeItem('login_last_loaded');
        localStorage.removeItem('onboarding_page_loaded');
        localStorage.removeItem('onboarding_last_loaded');
        
        // Show message to user about the issue
        setMessage("We detected an issue with your login flow. Please try again.");
      }
      
      // Update the last loaded time
      localStorage.setItem('login_last_loaded', now.toString());
    } catch (e) {
      console.error("Error managing flow state:", e);
    }
    
    // Debug redirect history
    try {
      const redirectHistory = JSON.parse(localStorage.getItem('redirectHistory') || '[]')
      console.log("Login page loaded, redirect history:", redirectHistory)
    } catch (e) {
      console.error("Error parsing redirect history:", e)
    }
    
    // Redirect authenticated users to library
    if (isAuthenticated && !authLoading) {
      // Clear any authentication flow state for a fresh start
      try {
        sessionStorage.removeItem('auth_flow');
        localStorage.removeItem('lastRedirect');
        localStorage.removeItem('redirectHistory');
      } catch (e) {
        console.error("Error clearing auth state:", e);
      }
      
      router.push('/page/library')
    }
  }, [isAuthenticated, authLoading, router, searchParams])

  // Memoized event handlers
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
  }, [])

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email/username and password")
      return
    }
    
    // Set initial flow state for login attempt
    try {
      sessionStorage.setItem('auth_flow', 'login_attempt');
    } catch (e) {
      console.error("Error setting flow state for login:", e);
    }
    
    setIsLoading(true)
    setError("")

    try {
      await login(email, password)
      // Login function in AuthContext handles the redirection
    } catch (error: any) {
      // Clear flow state on error
      try {
        sessionStorage.removeItem('auth_flow');
      } catch (e) {
        console.error("Error clearing flow state after login error:", e);
      }
      
      console.error("Login error:", error)
      
      // Handle different error cases
      if (error.message?.toLowerCase().includes("username")) {
        setError("Username not found")
      } else if (error.message?.toLowerCase().includes("invalid")) {
        setError("Invalid email/password combination")
      } else if (error.message?.toLowerCase().includes("credentials")) {
        setError("Invalid login credentials")
      } else if (error.message?.toLowerCase().includes("not found")) {
        setError("Account not found. Please register first.")
      } else if (error.message?.toLowerCase().includes("network")) {
        setError("Network error. Please check your connection.")
      } else {
        setError("An error occurred during login. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [email, password, login])

  // Derived state
  const isFormValid = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0
  }, [email, password])

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-gray-50 bg-center auth-background">
        <div className="w-full max-w-md p-8 rounded-lg bg-white dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <Image src={logo || "/placeholder.svg"} alt="ReaderSpot Logo" width={50} height={50} priority />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Welcome Back!</h1>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Email or Username"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className="bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400 pr-8"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Login help"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You can login with either your email address or username</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2 relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={toggleShowPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked: boolean | "indeterminate") => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <Link href="/page/forgot-password" className="text-sm text-yellow-400 hover:underline" legacyBehavior>
                <a>Forgot password?</a>
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500" 
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link href="/page/register" className="text-yellow-400 hover:underline" legacyBehavior>
                <a>Create an account</a>
              </Link>
            </p>
            
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Having trouble logging in?{" "}
              <Link href="/clear-auth" className="text-yellow-500 hover:underline" legacyBehavior>
                <a>Click here to reset</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

