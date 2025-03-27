"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, HelpCircle, Check, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/app/(components)/ui/button"
import { Input } from "@/app/(components)/ui/input"
import { Checkbox } from "@/app/(components)/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/(components)/ui/tooltip"
import logo from "@/app/assets/Logo.png"
import { useAuth } from "@/app/contexts/AuthContext"

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
  const { signup } = useAuth()
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
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const validateUsername = (value: string) => {
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
  }

  const validatePassword = (value: string) => {
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
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    validateUsername(value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    validatePassword(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!validateUsername(username)) {
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
      // Show success message and redirect
      router.push('/page/login?message=Registration successful! Please login with your credentials.')
    } catch (error: any) {
      if (error.message?.toLowerCase().includes("email")) {
        setError("This email is already registered")
      } else if (error.message?.toLowerCase().includes("password")) {
        setError("Password should be at least 6 characters")
      } else if (error.message?.toLowerCase().includes("username")) {
        setError("This username is already taken")
      } else {
        setError("Error creating account. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    const score = passwordStrength.score
    if (score < 2) return "bg-red-500"
    if (score < 3) return "bg-yellow-500"
    if (score < 4) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-gray-50 bg-center">
        <div className="w-full max-w-md p-8 rounded-lg bg-white dark:bg-gray-900/90 backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <Image src={logo || "/placeholder.svg"} alt="ReaderSpot Logo" width={50} height={50} />
          </div>

          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Create Account</h1>

          {(error || usernameError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error || usernameError}</span>
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
                  className="bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400 pr-8"
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
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400"
              />
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
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasMinLength ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasUpperCase ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasLowerCase ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span>Lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasNumber ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span>Number</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {passwordStrength.hasSpecialChar ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-transparent border-gray-300 dark:border-gray-700 focus:border-yellow-400"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                I have read and agreed to the{" "}
                <Link href="/terms" className="text-yellow-400 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-yellow-400 hover:underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500"
              disabled={isLoading || passwordStrength.score < 3}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-400">or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                    fill="#34A853"
                  />
                </svg>
              </Button>

              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </Button>

              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385h-3.047v-3.47h3.047v-2.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385c5.738-.9 10.126-5.864 10.126-11.854z" />
                </svg>
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/page/login" className="text-yellow-400 hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

