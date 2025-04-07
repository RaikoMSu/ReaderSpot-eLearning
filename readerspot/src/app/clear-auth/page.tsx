"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import logo from '@/app/assets/Logo.png'

export default function ClearAuthPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Cleaning up authentication state...")
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function clearAuth() {
      try {
        // Clear all local storage related to auth
        localStorage.clear()
        sessionStorage.clear()
        
        console.log("Local storage and session storage cleared")
        
        // Sign out from Supabase
        try {
          await supabase.auth.signOut({ scope: 'global' })
          console.log("Signed out from Supabase")
        } catch (e) {
          console.error("Error signing out from Supabase:", e)
          // Continue anyway - this is just a cleanup
        }
        
        // Set cookies to expire (this helps clean up any auth cookies)
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=')
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        })
        
        console.log("Cookies cleared")
        
        setMessage("Authentication state cleared successfully!")
        setSuccess(true)
        
        // After 3 seconds, redirect to login page
        setTimeout(() => {
          router.push('/page/login?message=Authentication reset successfully. Please log in again.')
        }, 3000)
      } catch (e) {
        console.error("Error clearing auth state:", e)
        setMessage("An error occurred while clearing authentication state.")
        setError(true)
      }
    }
    
    clearAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex justify-center mb-6">
          <Image src={logo || "/placeholder.svg"} alt="ReaderSpot Logo" width={50} height={50} priority />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          Authentication Reset
        </h1>
        
        <div className={`p-4 rounded mb-6 text-center ${
          success ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' : 
          error ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400' : 
          'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
        }`}>
          <p>{message}</p>
          
          {success && (
            <p className="mt-2 text-sm">Redirecting to login page...</p>
          )}
          
          {error && (
            <button 
              onClick={() => router.push('/page/login')}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Go to Login
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>This page helps resolve authentication issues by:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Clearing local browser storage</li>
            <li>Removing authentication cookies</li>
            <li>Signing out from all devices</li>
            <li>Resetting your browser session</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 