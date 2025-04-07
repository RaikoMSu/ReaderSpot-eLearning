"use client"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import Link from "@/app/components/NextLink"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, HelpCircle, Check, X } from "lucide-react"
import Image from "@/app/components/NextImage"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Checkbox } from "@/app/(components)/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/(components)/ui/tooltip"
import { Alert, AlertDescription } from "@/app/(components)/ui/alert"
import logo from "@/app/assets/Logo.png"
import { useAuth } from "@/app/contexts/AuthContext"
import { supabase } from "@/lib/supabase" // Use the singleton instance

type PasswordStrength = {
  score: number
  hasMinLength: boolean
  hasUpperCase: boolean
  hasLowerCase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/page/library')
    }
  }, [isAuthenticated, authLoading, router])

  // Check if email already exists (debounced)
  useEffect(() => {
    if (!email || !email.includes('@')) return;
    
    const checkEmailTimer = setTimeout(async () => {
      try {
        // Only check email format and existence if it's a valid format
        if (email.includes('@') && email.includes('.')) {
          // Check if email exists in user_profiles
          const { data, error } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('email', email)
            .maybeSingle();
            
          if (data) {
            setEmailError('This email is already registered');
          } else {
            setEmailError('');
          }
        }
      } catch (err) {
        console.error('Error checking email:', err);
      }
    }, 800); // Debounce for 800ms
    
    return () => clearTimeout(checkEmailTimer);
  }, [email]);

  // Memoized validation functions to prevent recreation on each render
  const validateUsername = useCallback((value: string): boolean => {
    if (value.includes('@')) {
      setUsernameError("Username cannot contain '@' symbol")
      return false
    }
    if (value.length < 3) {
      setUsernameError("Username must be at least 3 characters long")
      return false
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setUsernameError("Username can only contain letters, numbers, underscores, and hyphens")
      return false
    }
    setUsernameError("")
    return true
  }, [])

  const validatePassword = useCallback((value: string): boolean => {
    const strength: PasswordStrength = {
      score: 0,
      hasMinLength: value.length >= 8,
      hasUpperCase: /[A-Z]/.test(value),
      hasLowerCase: /[a-z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
    }

    let score = 0
    if (strength.hasMinLength) score++
    if (strength.hasUpperCase) score++
    if (strength.hasLowerCase) score++
    if (strength.hasNumber) score++
    if (strength.hasSpecialChar) score++

    strength.score = score
    setPasswordStrength(strength)
    return score >= 3 // Require at least 3 criteria to be met
  }, [])

  // Check if username already exists (debounced)
  useEffect(() => {
    if (!username || username.length < 3) return;
    
    const checkUsernameTimer = setTimeout(async () => {
      try {
        // Check if username exists in user_profiles
        const { data, error } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();
          
        if (data) {
          setUsernameError('This username is already taken');
        } else if (!usernameError) {
          // Only clear the error if there's no other username validation error
          setUsernameError('');
        }
      } catch (err) {
        console.error('Error checking username:', err);
      }
    }, 800); // Debounce for 800ms
    
    return () => clearTimeout(checkUsernameTimer);
  }, [username, usernameError]);

  // Event handlers with useCallback to prevent recreation on each render
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    validateUsername(value)
  }, [validateUsername])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    // Basic email validation
    if (value && !value.includes('@')) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }, [])

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    validatePassword(value)
  }, [validatePassword])

  const handleConfirmPasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }, [])

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev)
  }, [])

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    // Final validation before submission
    if (!validateUsername(username)) {
      setIsLoading(false)
      return
    }

    if (usernameError) {
      setError(usernameError)
      setIsLoading(false)
      return
    }

    if (emailError) {
      setError(emailError)
      setIsLoading(false)
      return
    }

    if (!validatePassword(password)) {
      setError("Password is not strong enough")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms of service")
      setIsLoading(false)
      return
    }

    try {
      await signup(username, email, password)
      
      // Show success message
      setSuccessMessage("Account created successfully! Please check your email to verify your account.")
      
      // Clear form
      setUsername("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setAgreedToTerms(false)
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/page/login?message=Please check your email to verify your account')
      }, 3000)
    } catch (error: any) {
      console.error("Registration error:", error)
      
      if (error.message?.toLowerCase().includes("email")) {
        setError("This email is already registered")
      } else if (error.message?.toLowerCase().includes("password")) {
        setError("Password should be at least 6 characters")
      } else if (error.message?.toLowerCase().includes("username")) {
        setError("This username is already taken")
      } else if (error.message?.toLowerCase().includes("network")) {
        setError("Network error. Please check your internet connection.")
      } else {
        setError("Error creating account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    username, 
    email, 
    password, 
    confirmPassword, 
    agreedToTerms, 
    usernameError,
    emailError,
    validateUsername, 
    validatePassword, 
    signup, 
    router
  ])

  // Memoize derived values
  const passwordStrengthColor = useMemo(() => {
    const score = passwordStrength.score
    if (score < 2) return "bg-red-500"
    if (score < 3) return "bg-yellow-500"
    if (score < 4) return "bg-blue-500"
    return "bg-green-500"
  }, [passwordStrength.score])

  const isFormValid = useMemo(() => {
    return (
      !usernameError &&
      !emailError &&
      username.length >= 3 &&
      email.includes('@') &&
      passwordStrength.score >= 3 &&
      password === confirmPassword &&
      agreedToTerms
    )
  }, [
    username, 
    usernameError, 
    email,
    emailError,
    passwordStrength.score, 
    password, 
    confirmPassword, 
    agreedToTerms
  ])

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-gray-50 bg-center auth-background">
        <div className="w-full max-w-md p-8 rounded-lg bg-white dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <Image src={logo || "/placeholder.svg"} alt="ReaderSpot Logo" width={50} height={50} priority />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Create Account</h1>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {(error || usernameError || emailError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error || usernameError || emailError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  required
                  className={`bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400 pr-8 ${
                    usernameError ? 'border-red-500' : ''
                  }`}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Username must be at least 3 characters and can only contain letters, numbers, underscores, and hyphens</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  className={`bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400 ${
                    emailError ? 'border-red-500' : ''
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-1 space-y-1">
                <div className="flex flex-col space-y-1">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrengthColor} transition-all`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Password strength: {passwordStrength.score < 2 ? "Weak" : passwordStrength.score < 4 ? "Medium" : "Strong"}
                  </span>
                </div>

                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-1">
                    {passwordStrength.hasMinLength ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={passwordStrength.hasMinLength ? "text-green-500" : "text-red-500"}>
                      At least 8 characters
                    </span>
                  </li>
                  <li className="flex items-center gap-1">
                    {passwordStrength.hasUpperCase ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={passwordStrength.hasUpperCase ? "text-green-500" : "text-red-500"}>
                      At least one uppercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-1">
                    {passwordStrength.hasLowerCase ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={passwordStrength.hasLowerCase ? "text-green-500" : "text-red-500"}>
                      At least one lowercase letter
                    </span>
                  </li>
                  <li className="flex items-center gap-1">
                    {passwordStrength.hasNumber ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={passwordStrength.hasNumber ? "text-green-500" : "text-red-500"}>
                      At least one number
                    </span>
                  </li>
                  <li className="flex items-center gap-1">
                    {passwordStrength.hasSpecialChar ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <X className="h-3 w-3 text-red-500" />
                    )}
                    <span className={passwordStrength.hasSpecialChar ? "text-green-500" : "text-red-500"}>
                      At least one special character (e.g., !@#$)
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                  className={`bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400 ${
                    confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={toggleShowConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords don't match</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked: boolean | "indeterminate") => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                I agree to the{" "}
                <Link href="/terms" className="text-yellow-400 hover:underline" legacyBehavior>
                  <a>Terms of Service</a>
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-yellow-400 hover:underline" legacyBehavior>
                  <a>Privacy Policy</a>
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Creating account...
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/page/login" className="text-yellow-400 hover:underline" legacyBehavior>
                <a>Sign in</a>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

